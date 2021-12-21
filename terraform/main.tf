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

resource "azurerm_resource_group" "lol_counter_scrapper" {
  name     = "lol-counter-scrapper-rg"
  location = "West Europe"
}

resource "azurerm_storage_account" "lol_counter_scrapper" {
  name                     = "lolcounterscrapper"
  resource_group_name      = azurerm_resource_group.lol_counter_scrapper.name
  location                 = azurerm_resource_group.lol_counter_scrapper.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

resource "azurerm_app_service_plan" "lol_counter_scrapper" {
  name                = "lol-counter-scrapper-service-plan"
  location            = azurerm_resource_group.lol_counter_scrapper.location
  resource_group_name = azurerm_resource_group.lol_counter_scrapper.name

  sku {
    tier = "Standard"
    size = "S1"
  }
}

resource "azurerm_function_app" "lol_counter_scrapper" {
  name                       = "lol-counter-scrapper"
  location                   = azurerm_resource_group.lol_counter_scrapper.location
  resource_group_name        = azurerm_resource_group.lol_counter_scrapper.name
  app_service_plan_id        = azurerm_app_service_plan.lol_counter_scrapper.id
  storage_account_name       = azurerm_storage_account.lol_counter_scrapper.name
  storage_account_access_key = azurerm_storage_account.lol_counter_scrapper.primary_access_key
}