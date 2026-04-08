pipeline {
    agent { label 'x86_64' }

    environment {
        REGISTRY = "ghcr.io"
        IMAGE_BASE = "harimalam/nest-forge"
        
        GHCR_CREDS   = credentials('ghcr-login')
        SSH_KEY_ID   = 'vm-arm-01-ssh-key' 
        VM_IP        = credentials('PROD_SERVER_IP')
        VM_USER      = credentials('PROD_SSH_USER')
        DEPLOY_PATH  = credentials('PROD_DEPLOY_PATH')
    }

    stages {
        stage('Production Pipeline') {
            when { branch 'main' }
            
            stages {
                stage('Cleanup & Checkout') {
                    steps {
                        cleanWs()
                        checkout scm
                    }
                }

              stage('Build & Push') {
                    steps {
                        script {
                            def agentArch = sh(script: "uname -m", returnStdout: true).trim()
                            echo "Detected Agent Architecture: ${agentArch}"

                            sh "echo ${GHCR_CREDS_PSW} | docker login ${REGISTRY} -u ${GHCR_CREDS_USR} --password-stdin"

                            if (agentArch == 'aarch64') {
                                echo "Running on ARM agent. Performing native build..."
                                sh """
                                    docker build \
                                    -t ${REGISTRY}/${IMAGE_BASE}:${env.BUILD_ID} \
                                    -t ${REGISTRY}/${IMAGE_BASE}:latest \
                                    --push .
                                """
                            } else {
                                echo "Running on x86 agent. Performing Multi-arch Buildx build..."
                                sh "docker buildx create --name jenkins-builder --use || docker buildx use jenkins-builder"
                                sh "docker buildx inspect --bootstrap"
                                sh """
                                    docker buildx build \
                                    --platform linux/arm64 \
                                    -t ${REGISTRY}/${IMAGE_BASE}:${env.BUILD_ID} \
                                    -t ${REGISTRY}/${IMAGE_BASE}:latest \
                                    --push .
                                """
                            }
                        }
                    }
                }
                stage('Remote Deploy via SSH') {
                    steps {
                        sshagent([env.SSH_KEY_ID]) {
                            sh """
                                ssh -o StrictHostKeyChecking=no ${VM_USER}@${VM_IP} << 'EOF'
                                    echo "Successfully connected to ARM VM. Updating App..."
                                    
                                    # 1. Pull the new ARM64 image
                                    docker pull ${REGISTRY}/${IMAGE_BASE}:latest
                                    
                                    # 2. Restart the container
                                    cd ${DEPLOY_PATH}
                                    docker compose up -d
                                    
                                    # 3. Targeted Cleanup (Fixed the xargs error)
                                    docker images ${REGISTRY}/${IMAGE_BASE} -f "dangling=true" -q | xargs -r docker rmi || true
                                EOF
                            """
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                sh "docker buildx prune -f --filter until=24h"
                cleanWs()
            }
        }
        success {
            echo "Build ${env.BUILD_ID} is LIVE on the ARM Server!"
        }
    }
}