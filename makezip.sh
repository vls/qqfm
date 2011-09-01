#!/bin/bash

BUILDDIR="build"

cd `dirname $0`

if [ ! -d ${BUILDDIR} ]; then
    mkdir -p ${BUILDDIR}
fi

zip build/qqfm.zip `git ls-files | xargs`


