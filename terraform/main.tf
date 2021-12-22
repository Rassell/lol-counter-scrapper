terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "=2.46.0"
    }
  }

  cloud {
    organization = "rassell-github"

    workspaces {
      name = "lol-counter-scrapper"
    }
  }
}

provider "azurerm" {
  features {}
}

locals {
  location = "West Europe"
}

resource "azurerm_resource_group" "lol_counter_scrapper" {
  name     = "lol-counter-scrapper-rg"
  location = local.location
}

resource "azurerm_storage_account" "lol_counter_scrapper" {
  name                     = "lolcounterscrapper"
  resource_group_name      = azurerm_resource_group.lol_counter_scrapper.name
  location                 = azurerm_resource_group.lol_counter_scrapper.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

resource "azurerm_application_insights" "lol_counter_scrapper" {
  name                = "lol-counter-scrapper-application-insights"
  location            = local.location
  resource_group_name = azurerm_resource_group.lol_counter_scrapper.name
  application_type    = "Node.JS"
}

resource "azurerm_app_service_plan" "lol_counter_scrapper" {
  name                = "lol-counter-scrapper-service-plan"
  location            = azurerm_resource_group.lol_counter_scrapper.location
  resource_group_name = azurerm_resource_group.lol_counter_scrapper.name

  kind     = "Linux"
  reserved = true

  sku {
    tier = "Dynamic"
    size = "Y1"
  }
}

resource "azurerm_function_app" "lol_counter_scrapper" {
  name                       = "lol-counter-scrapper"
  location                   = azurerm_resource_group.lol_counter_scrapper.location
  resource_group_name        = azurerm_resource_group.lol_counter_scrapper.name
  app_service_plan_id        = azurerm_app_service_plan.lol_counter_scrapper.id
  storage_account_name       = azurerm_storage_account.lol_counter_scrapper.name
  storage_account_access_key = azurerm_storage_account.lol_counter_scrapper.primary_access_key

  os_type = "linux"
  version = "~3"

  app_settings = {
    FUNCTIONS_WORKER_RUNTIME       = "node",
    WEBSITE_NODE_DEFAULT_VERSION   = "node|14",
    APPINSIGHTS_INSTRUMENTATIONKEY = azurerm_application_insights.lol_counter_scrapper.instrumentation_key,
  }
}
