locals {
  project_root = "${path.root}/.."
  source_dir   = local.project_root

  source_hash = sha1(join("", [
    filemd5("${local.source_dir}/package.json"),
    filemd5("${local.source_dir}/yarn.lock"),
    sha1(join("", [for f in fileset("${local.source_dir}/src", "**/*.ts") : filemd5("${local.source_dir}/src/${f}")])),
    jsonencode(var.cloud_run_service_config.environment_variables)
  ]))

  image_name = "eu.gcr.io/${var.basic_config.gcp_project_id}/${var.cloud_run_service_config.name}-${var.basic_config.environment}:${local.source_hash}"
}

resource "docker_image" "app_image" {
  name = local.image_name

  build {
    context    = local.source_dir
    dockerfile = "${local.source_dir}/Dockerfile"
  }
}

resource "docker_registry_image" "app_image_push" {
  name = docker_image.app_image.name
}

resource "google_cloud_run_v2_service" "service" {
  name                = "${var.cloud_run_service_config.name}-${var.basic_config.environment}"
  location            = var.basic_config.gcp_region
  deletion_protection = false

  template {
    containers {
      image = docker_registry_image.app_image_push.name

      resources {
        limits = {
          memory = "${var.cloud_run_service_config.memory_limit}Mi"
          cpu    = var.cloud_run_service_config.cpu_limit
        }
      }

      dynamic "env" {
        for_each = var.cloud_run_service_config.environment_variables
        content {
          name  = env.key
          value = env.value
        }
      }

      env {
        name  = "VERSION"
        value = local.source_hash
      }

      env {
        name  = "NODE_ENV"
        value = var.basic_config.environment
      }
    }

    vpc_access {
      network_interfaces {
        network    = var.cloud_run_service_config.network_id
        subnetwork = var.cloud_run_service_config.subnetwork_id
        tags       = ["kenan-nat"]
      }
      egress = "ALL_TRAFFIC"
    }

    scaling {
      min_instance_count = var.cloud_run_service_config.min_instances
      max_instance_count = var.cloud_run_service_config.max_instances
    }

    timeout = "${var.cloud_run_service_config.timeout_seconds}s"

    service_account = var.cloud_run_service_config.run_time_service_account_email
  }

  depends_on = [
    docker_registry_image.app_image_push
  ]
}
