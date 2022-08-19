import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { VPC, EKS } from '@tinystacks/cdk-constructs';
import { constructId } from '@tinystacks/utils';
import { NodegroupAmiType } from 'aws-cdk-lib/aws-eks';
import { InstanceArchitecture } from 'aws-cdk-lib/aws-ec2';

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

    const vpcConstruct = new VPC(this, constructId('galileo', 'vpc'), { internetAccess: internetAccess });
    const eksConstruct = new EKS(this, constructId('galileo', 'k8'), {
      clusterName: 'hello-helm',
      vpc: vpcConstruct.vpc,
      internetAccess: internetAccess
    });

    const amiType: NodegroupAmiType = eksConstruct.instanceType.architecture === InstanceArchitecture.ARM_64 ?
      NodegroupAmiType.AL2_ARM_64 :
      NodegroupAmiType.AL2_X86_64;

    eksConstruct.cluster.addNodegroupCapacity(constructId('galileo', 'core'), {
      nodegroupName: 'hello-helm',
      labels: { 'hello-helm-type': 'main' },
      tags: {
        [`k8s.io/cluster-autoscaler/${eksConstruct.clusterName}`]: 'owned',
        'k8s.io/cluster-autoscaler/enabled': 'true'
      },
      amiType,
      instanceTypes: [eksConstruct.instanceType],
      minSize: 1,
      maxSize: 5,
      desiredSize: 1
    });
    
    // eksConstruct.cluster.addHelmChart(constructId('helloHelmChart'), {

    // });
  }
}