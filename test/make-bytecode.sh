#!/bin/bash

set -eu

oftb compile -f anfir -o empty.anfir
oftb compile -f anfir -o hello.anfir std/internal/examples/hello-world
oftb compile -f anfir -o prime-sieve.anfir std/internal/examples/prime-sieve
