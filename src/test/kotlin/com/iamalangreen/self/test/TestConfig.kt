package com.iamalangreen.self.test

import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.springframework.test.context.junit.jupiter.SpringExtension
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.junit.jupiter.Container
import org.testcontainers.junit.jupiter.Testcontainers
import org.junit.jupiter.api.extension.ExtendWith

@Testcontainers
@ExtendWith(SpringExtension::class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
abstract class TestConfig {

    companion object {
        @Container
        private val postgresqlContainer = PostgreSQLContainer<Nothing>("postgres:16-alpine")
            .apply {
                withDatabaseName("testdb")
                withUsername("testuser")
                withPassword("testpassword")
            }

        @DynamicPropertySource
        @JvmStatic
        fun registerDynamicProperties(registry: DynamicPropertyRegistry) {
            registry.add("spring.datasource.url", { postgresqlContainer.jdbcUrl })
            registry.add("spring.datasource.username", { postgresqlContainer.username })
            registry.add("spring.datasource.password", { postgresqlContainer.password })
            registry.add("spring.jpa.hibernate.ddl-auto", { "create-drop" })
        }
    }
}
