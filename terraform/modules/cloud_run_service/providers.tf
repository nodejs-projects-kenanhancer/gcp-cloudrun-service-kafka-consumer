terraform {
  required_providers {
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
