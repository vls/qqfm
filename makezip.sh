#!/bin/bash

BUILDDIR="build"
TARGET="qqfm.zip"

cd `dirname $0`

if [ ! -d ${BUILDDIR} ]; then
    mkdir -p ${BUILDDIR}
fi

rm -f ${BUILDDIR}/${TARGET}

zip ${BUILDDIR}/${TARGET} `git ls-files | xargs`


