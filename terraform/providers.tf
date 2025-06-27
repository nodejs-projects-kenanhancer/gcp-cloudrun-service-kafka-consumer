terraform {
  required_providers {
    github = {
      version = ">= 6.5.0"
      source  = "integrations/github"
    }
    google = {
      version = ">= 6.16.0"
      source  = "hashicorp/google"
    }
    docker = {
      version = ">= 3.0.2"
      source  = "kreuzwerker/docker"
    }
  }
  required_version = ">=1.10.5"
}

# GCP
provider "google" {
  project = var.basic_config.gcp_project_id
  region  = var.basic_config.gcp_region
}

data "google_client_config" "default" {}

provider "docker" {
  registry_auth {
    address  = "eu.gcr.io"
    username = "oauth2accesstoken"
    password = data.google_client_config.default.access_token
  }
}
