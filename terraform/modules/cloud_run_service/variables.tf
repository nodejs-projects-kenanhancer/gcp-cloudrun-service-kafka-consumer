variable "basic_config" {
  description = "Basic Configuration"
  type = object({
    environment    = string
    gcp_project_id = string
    gcp_region     = string
  })
}

variable "cloud_run_service_config" {
  description = "Configuration for the Cloud Run service"
  type = object({
    name                             = string
    memory_limit                     = number      # Memory limit in Mi (e.g., 512)
    cpu_limit                        = string      # CPU limit (e.g., "1000m")
    concurrency                      = number      # Max concurrent requests per container
    timeout_seconds                  = number      # Request timeout in seconds
    min_instances                    = number      # Minimum number of instances
    max_instances                    = number      # Maximum number of instances
    environment_variables            = map(string) # Environment variables
    build_time_service_account_email = string      # Service account for Cloud Build
    run_time_service_account_email   = string      # Service account for Cloud Run
    vpc_connector_name               = string      # VPC Connector name
    network_id                       = string      # VPC Network name
    subnetwork_id                    = string      # VPC Subnetwork name
    ingress                          = string      # "all", "internal", "internal-and-cloud-load-balancing"     # "all", "internal", "internal-and-cloud-load-balancing"
  })
}

variable "github_config" {
  description = "GitHub repository configuration for Cloud Build"
  type = object({
    owner  = string
    repo   = string
    branch = string
  })
  default = {
    owner  = ""
    repo   = ""
    branch = "main"
  }
}
