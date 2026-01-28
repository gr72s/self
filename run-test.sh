#!/bin/bash

if [ $# -ne 1 ]; then
    echo "Usage: ./run-test.sh <TestName>"
    echo "Example: ./run-test.sh test.TestConfig"
    exit 1
fi

# 拼接完整的测试类名
fullTestName="com.iamalangreen.self.$1"

# 执行测试命令
echo "Running test: $fullTestName"
./gradlew test --tests "$fullTestName"