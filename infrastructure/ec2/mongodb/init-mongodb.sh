#!/usr/bin/env bash
sudo docker compose exec -T mongodb sh -ec '
  mongosh
    --eval "const purchases = db.getSiblingDB(\"purchase_system\"); if (!purchases.getCollectionNames().includes(\"purchases\")) purchases.createCollection(\"purchases\");"
'