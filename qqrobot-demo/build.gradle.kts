import org.jetbrains.kotlin.gradle.tasks.KotlinCompile
import java.nio.charset.StandardCharsets

@Suppress("DSL_SCOPE_VIOLATION")
plugins {
    java
    alias(libs.plugins.dependency.management)
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.kotlin)
    alias(libs.plugins.kotlin.spring)
    alias(libs.plugins.kotlin.jpa)
}

group = "de.honoka.qqrobot"
version = libs.versions.root.get()

java {
    toolchain.languageVersion = JavaLanguageVersion.of(17)
}

dependencies {
    //Spring Boot
    implementation("org.springframework.boot:spring-boot-starter")
    implementation("org.springframework.boot:spring-boot-starter-web")
    //机器人框架
    implementation(libs.qqrobot.spring.boot.starter)
    //一些杂项
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    listOf(
        libs.lombok,
        "org.springframework.boot:spring-boot-configuration-processor"
    ).forEach {
        compileOnly(it)
        annotationProcessor(it)
        testCompileOnly(it)
        testAnnotationProcessor(it)
    }
}

tasks {
    compileJava {
        options.encoding = StandardCharsets.UTF_8.name()
    }

    withType<KotlinCompile> {
        kotlinOptions.jvmTarget = java.sourceCompatibility.toString()
    }

    test {
        useJUnitPlatform()
    }
}
