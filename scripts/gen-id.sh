#!/bin/bash

id=$(id -u)
uname=$(id -nu)

echo "uname:$uname & id:$id"

node scripts/remove-env-host.js

echo "IY_H_NAME=$uname
IY_H_ID=$id" >> env/.env.dev