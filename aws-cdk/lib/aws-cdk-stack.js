const cdk = require('@aws-cdk/core');
const ec2 = require('@aws-cdk/aws-ec2');
const iam = require('@aws-cdk/aws-iam');
const ecs = require('@aws-cdk/aws-ecs');
const path = require('path');
const ecs_patterns = require('@aws-cdk/aws-ecs-patterns');
const { PolicyStatement } = require('@aws-cdk/aws-iam');

// Stack properties - what region to deploy to
const props = {
  env: {
    region: 'us-east-1',
    account: 121323684128,
  },
};

class CdkStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);
    // The code that defines your stack goes here

    // IAM inline role - the service principal is required
    const taskRole = new iam.Role(this, 'fargate-task-role', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    taskRole.addToPolicy(
      new PolicyStatement({
        resources: ['*'],
        actions: [
          'ecr:GetAuthorizationToken',
          'ecr:BatchCheckLayerAvailability',
          'ecr:GetDownloadUrlForLayer',
          'ecr:BatchGetImage',
          'logs:CreateLogStream',
          'logs:PutLogEvents',
        ],
      }),
    );
    // Define a fargate task with the newly created execution and task roles
    const taskDefinition = new ecs.FargateTaskDefinition(
      this,
      'fargate-task-definition',
      {
        taskRole: taskRole,
        executionRole: taskRole,
      },
    );

    // Import a local docker image and set up logger
    const container = taskDefinition.addContainer('miko-fargate-container', {
      image: ecs.ContainerImage.fromRegistry(
        '121323684128.dkr.ecr.us-east-1.amazonaws.com/aio-miko-nestjs',
      ),
      logging: new ecs.AwsLogDriver({
        streamPrefix: 'miko-fargate-log-prefix',
      }),
    });

    container.addPortMappings({
      containerPort: 3000,
      protocol: ecs.Protocol.TCP,
    });

    // NOTE: I've been creating a new VPC in us-east-2 (Ohio) to keep it clean, so se that at the top in stackProps
    // Create a vpc to hold everything - this creates a brand new vpc
    // Remove this if you are using us-east-1 and the existing non-prod vpc as commented out below

    // const vpc = new ec2.Vpc(this, "miko-fargate-vpc", {
    // 	maxAzs: 2,
    // 	natGateways: 1
    // });

    // Create the cluster
    // const cluster = new ecs.Cluster(this, "miko-fargate-cluster", { vpc });
    const cluster = new ecs.Cluster(this, 'miko-fargate-cluster');

    // Create a load-balanced Fargate service and make it public
    new ecs_patterns.ApplicationLoadBalancedFargateService(
      this,
      'mikoService',
      {
        cluster: cluster, // Required
        cpu: 256, // Default is 256
        desiredCount: 1, // Default is 1
        taskDefinition: taskDefinition,
        memoryLimitMiB: 512, // Default is 512
        publicLoadBalancer: true, // Default is false
      },
    );
  }
}

module.exports = { CdkStack };
