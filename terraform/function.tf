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

resource "cloudflare_workers_kv_namespace" "rassell_github" {
  title = "rassell-github"
}

resource "cloudflare_worker_script" "lol_counter_scrapper" {
  name    = "lol-counter-scrapper"
  content = <<EOF
              EOF

  kv_namespace_binding {
    name         = "rassell_github"
    namespace_id = cloudflare_workers_kv_namespace.rassell_github.id
  }
}

resource "cloudflare_worker_cron_trigger" "example_trigger" {
  script_name = cloudflare_worker_script.lol_counter_scrapper.name
  schedules = [
    "00 11 * * mon-fri",
  ]
}
