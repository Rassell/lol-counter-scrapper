variable "cat" {
  type = string
}

terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 3.0"
    }
  }

  cloud {
    organization = "rassell-github"

    workspaces {
      name = "lol-counter-scrapper"
    }
  }
}

provider "cloudflare" {
  api_token = var.cat
}

resource "cloudflare_worker_script" "example_script" {
  name    = "example-script"
  content = file("path/to/my.js")
}

resource "cloudflare_worker_cron_trigger" "example_trigger" {
  script_name = cloudflare_worker_script.example_script.name
  schedules = [
    "*/5 * * * *",      # every 5 minutes
    "10 7 * * mon-fri", # 7:10am every weekday
  ]
}
