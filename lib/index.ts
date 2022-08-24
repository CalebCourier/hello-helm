import * as path from 'path';
import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { VPC, EKS } from '@tinystacks/aws-cdk-constructs';
import { constructId } from '@tinystacks/utils';
import { NodegroupAmiType } from 'aws-cdk-lib/aws-eks';
import { InstanceArchitecture } from 'aws-cdk-lib/aws-ec2';
import { Role, User } from 'aws-cdk-lib/aws-iam';
import { Asset } from 'aws-cdk-lib/aws-s3-assets';

export interface HelloHelmStackProps extends StackProps {
  internetAccess: boolean;
}

export class HelloHelmStack extends Stack {
  constructor (scope: Construct, id: string, props: HelloHelmStackProps) {
    super(scope, id, props);

    const {
      internetAccess
    } = props;

    const region = Stack.of(this).region;

    new CfnOutput(this, constructId('region'), {
      description: `${id}-region`,
      value: region
    });

    const vpcConstruct = new VPC(this, constructId('hello-helm', 'vpc'), { internetAccess });
    const eksConstruct = new EKS(this, constructId('hello-helm', 'k8'), {
      clusterName: 'hello-helm',
      vpc: vpcConstruct.vpc,
      internetAccess
    });

    eksConstruct.cluster.awsAuth.addUserMapping(User.fromUserArn(this, constructId('rootUser'), 'arn:aws:iam::222140259348:user/test-user'), {
      username: 'test-user',
      groups: [
        'system:masters',
        'system:bootstrappers',
        'system:nodes'
      ]
    });
    
    eksConstruct.cluster.awsAuth.addRoleMapping(Role.fromRoleArn(this, constructId('orgRole'), 'arn:aws:iam::222140259348:role/OrganizationAccountAccessRole'), {
      username: 'org-role',
      groups: [
        'system:masters',
        'system:bootstrappers',
        'system:nodes'
      ]
    });

    const amiType: NodegroupAmiType = eksConstruct.instanceType.architecture === InstanceArchitecture.ARM_64 ?
      NodegroupAmiType.AL2_ARM_64 :
      NodegroupAmiType.AL2_X86_64;

    eksConstruct.cluster.addNodegroupCapacity(constructId('hello-helm', 'main'), {
      nodegroupName: 'hello-helm',
      labels: { 'hello-helm-type': 'main' },
      tags: {
        [`k8s.io/cluster-autoscaler/${eksConstruct.clusterName}`]: 'owned',
        'k8s.io/cluster-autoscaler/enabled': 'true'
      },
      amiType,
      instanceTypes: [eksConstruct.instanceType],
      minSize: 1,
      maxSize: 1,
      desiredSize: 1
    });

    /**
     * NOTE: This helm chart is hard coded; if you plan to launch this, update the image url and port.
     */
    const helmChartAsset = new Asset(this, constructId('helmChartAsset'), {
      path: path.resolve(__dirname, '../hello-helm')
    });
    
    eksConstruct.cluster.addHelmChart(constructId('helloHelmChart'), {
      chartAsset: helmChartAsset
    });
  }
}