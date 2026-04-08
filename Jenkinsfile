pipeline {
    agent { label 'built_in' }

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
                stage('Remote Deploy via SSH') {
                    steps {
                        sshagent([env.SSH_KEY_ID]) {
                            sh """
                                ssh -o StrictHostKeyChecking=no ${VM_USER}@${VM_IP} << 'EOF'
                                    echo "Successfully connected to ARM VM. Updating App..."

                                    # Go to deploy path
                                    cd ${DEPLOY_PATH}

                                    # 0. Ensure we are on the correct branch
                                    git checkout main

                                    # 1. Reset local changes and pull latest code
                                    git fetch origin
                                    git reset --hard origin/main
                                    git clean -fd

                                    # 2. Restart the container
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
        success {
            echo "Build ${env.BUILD_ID} is LIVE on the ARM Server!"
        }
    }
}