package com.iamalangreen.self.lifting

import org.springframework.boot.CommandLineRunner
import org.springframework.core.io.ClassPathResource
import org.springframework.stereotype.Component
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator
import javax.sql.DataSource

@Component
class MuscleDataInitializer(
    private val muscleRepository: MuscleRepository,
    private val dataSource: DataSource
) : CommandLineRunner {

    override fun run(vararg args: String?) {
        if (muscleRepository.count() == 0L) {
            val resource = ClassPathResource("data/lifting_muscle.sql")
            val populator = ResourceDatabasePopulator(resource)
            populator.execute(dataSource)
        }
    }
}
