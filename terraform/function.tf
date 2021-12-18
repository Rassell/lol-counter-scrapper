variable "CLOUDFLARE_API_KEY" {
  type = string
}

terraform {
  required_providers {
    cloudflare = {
      source = "cloudflare/cloudflare"
      version = "~> 3.0"
    }
  }

  cloud {
    organization = "lol-counter-scrapper"

    workspaces {
      tags = ["scrapper"]
    }
  }
}

provider "cloudflare" {
  email   = "sordesos@gmail.com"
  api_key = var.CLOUDFLARE_API_KEY
}

resource "cloudflare_worker_script" "example_script" {
  name    = "example-script"
  content = file("path/to/my.js")
}

resource "cloudflare_worker_cron_trigger" "example_trigger" {
  script_name = cloudflare_worker_script.example_script.name
  schedules   = [
    "*/5 * * * *",      # every 5 minutes
    "10 7 * * mon-fri", # 7:10am every weekday
  ]
}
