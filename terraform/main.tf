data "terraform_remote_state" "shared_resources" {
  backend = "gcs"
  config = {
    bucket         = "${var.basic_config.tf_state_bucket}-${var.basic_config.gcp_project_id}"
    prefix         = var.basic_config.tf_state_prefix_for_shared_resources
    encryption_key = var.basic_config.tf_encryption_key
  }
}

data "terraform_remote_state" "github_actions_resources" {
  backend = "gcs"
  config = {
    bucket         = "${var.basic_config.tf_state_bucket}-${var.basic_config.gcp_project_id}"
    prefix         = var.basic_config.tf_state_prefix_for_github_actions_resources
    encryption_key = var.basic_config.tf_encryption_key
  }
}

module "storage_buckets" {
  source   = "./modules/storage"
  for_each = var.storages

  basic_config  = var.basic_config
  bucket_config = each.value
}

module "cloud_run_services" {
  source   = "./modules/cloud_run_service"
  for_each = var.cloud_run_services

  providers = {
    docker = docker
    google = google
  }

  basic_config  = var.basic_config
  github_config = var.github_config
  cloud_run_service_config = merge(each.value, {
    run_time_service_account_email   = data.terraform_remote_state.shared_resources.outputs.iam_resources.result.service_accounts.cloud_function.email
    build_time_service_account_email = data.terraform_remote_state.github_actions_resources.outputs.formatted_service_account
    vpc_connector_name               = data.terraform_remote_state.shared_resources.outputs.network_resources.result.vpc_connector.id
    network_id                       = data.terraform_remote_state.shared_resources.outputs.network_resources.result.network.id
    subnetwork_id                    = data.terraform_remote_state.shared_resources.outputs.network_resources.result.subnet.id
  })
}
