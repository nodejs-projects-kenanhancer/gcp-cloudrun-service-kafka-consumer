variable "basic_config" {
  description = "Basic Configuration"
  type = object({
    environment                                  = string
    gcp_project_id                               = string
    gcp_region                                   = string
    tf_state_bucket                              = string
    tf_encryption_key                            = string
    tf_state_prefix_for_shared_resources         = string
    tf_state_prefix_for_github_actions_resources = string
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

# Storage configuration variables
variable "storages" {
  description = "Map of storage configurations including bucket names, force destroy settings, and IAM roles"
  type = map(object({
    name          = string
    force_destroy = bool
  }))
}

variable "cloud_run_services" {
  description = "Configuration for the Cloud Run service"
  type = map(object({
    name                  = string
    memory_limit          = number      # Memory limit in Mi (e.g., 512)
    cpu_limit             = string      # CPU limit (e.g., "1000m")
    concurrency           = number      # Max concurrent requests per container
    timeout_seconds       = number      # Request timeout in seconds
    min_instances         = number      # Minimum number of instances
    max_instances         = number      # Maximum number of instances
    environment_variables = map(string) # Environment variables
    ingress               = string      # "all", "internal", "internal-and-cloud-load-balancing"
  }))
}
