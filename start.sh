#!/bin/bash
/bin/bash -c "mongod --fork -f /etc/mongod.conf"
/bin/bash -c "npm start"
