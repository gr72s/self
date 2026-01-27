package com.iamalangreen.self.test

import com.opentable.db.postgres.embedded.EmbeddedPostgres
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
abstract class TestConfig {

    companion object {
        private val embeddedPostgres: EmbeddedPostgres by lazy {
            EmbeddedPostgres.builder()
                .setPort(0)
                .start()
        }

        @DynamicPropertySource
        @JvmStatic
        fun registerDynamicProperties(registry: DynamicPropertyRegistry) {
            registry.add("spring.datasource.url") {
                embeddedPostgres.getJdbcUrl("postgres", "postgres")
            }
            registry.add("spring.datasource.username", { "postgres" })
            registry.add("spring.datasource.password", { "" })
            registry.add("spring.jpa.hibernate.ddl-auto", { "create" })
        }
    }
}
