import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { VPC, EKS } from '@tinystacks/cdk-constructs';
import { constructId } from '@tinystacks/utils';

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
    new EKS(this, constructId('galileo', 'k8'), {
      clusterName: 'hello-helm',
      vpc: vpcConstruct.vpc,
      internetAccess: internetAccess
    });

    // eksConstruct.cluster.addHelmChart(constructId('helloHelmChart'), {

    // });
  }
}