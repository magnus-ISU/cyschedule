#!/bin/bash
curl 'https://classes.iastate.edu/app/rest/courses/preferences' \
 -X POST \
 -H 'Content-Type: application/json; charset=UTF-8' \
 --data-raw $'{"defSem":2,"selectedTerm":2,"selectedDepartment":"MATH"}'

#-H 'Accept-Encoding: gzip, deflate, br' \
