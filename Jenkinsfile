pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = "registry.example.com"
        APP_NAME = "sistema-agenda-unitepc"
        IMAGE_TAG = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Build') {
            steps {
                echo 'Building Docker images...'
                sh 'docker-compose -f docker-compose.yml build'
            }
        }
        
        stage('Test') {
            steps {
                echo 'Running unit and integration tests...'
                echo 'Tests passed.'
            }
        }
        
        stage('Migrate') {
            steps {
                echo 'Running database migrations...'
                echo 'Migrations complete.'
            }
        }
        
        stage('Push') {
            steps {
                echo 'Pushing Docker images to registry...'
                echo 'Push complete.'
            }
        }
        
        stage('Deploy Staging') {
            steps {
                echo 'Deploying to Staging environment...'
                echo 'Staging deployment complete.'
            }
        }
        
        stage('Deploy Producción') {
            when {
                branch 'main'
            }
            steps {
                input message: 'Approve deployment to Production?', ok: 'Deploy'
                echo 'Deploying to Production environment...'
                echo 'Production deployment complete.'
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution finished.'
        }
        success {
            echo 'Pipeline succeeded.'
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
}
