param(
    [Parameter(Mandatory=$true)]
    [string]$TestName
)

# 拼接完整的测试类名
$fullTestName = "com.iamalangreen.self.$TestName"

# 执行测试命令
Write-Host "Running test: $fullTestName"
./gradlew test --tests $fullTestName