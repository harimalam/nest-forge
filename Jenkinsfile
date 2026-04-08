pipeline {
    agent { label 'built_in' }

    environment {
        REGISTRY     = "ghcr.io"
        IMAGE_BASE   = "harimalam/nest-forge"
        
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
                stage('Remote Deploy via SSH') {
                    steps {
                        sshagent([env.SSH_KEY_ID]) {
                            sh """
                                ssh -o StrictHostKeyChecking=no ${VM_USER}@${VM_IP} '
                                    echo "Successfully connected to ARM VM. Updating App..."

                                    cd ${DEPLOY_PATH}

                                    # Ensure we are on main and up-to-date
                                    git fetch origin
                                    git reset --hard origin/main

                                    # Restart containers
                                    docker compose down
                                    docker compose up -d --build

                                    # Cleanup dangling images
                                    docker images ${REGISTRY}/${IMAGE_BASE} -f "dangling=true" -q | xargs -r docker rmi || true
                                '
                            """
                        }
                    }
                }
            }
        }
    }

    post {
        success {
            echo "Build ${env.BUILD_ID} is LIVE on the ARM Server!"
        }
    }
}