export CDK_DEFAULT_ACCOUNT=$AWS_ACCOUNT_ID;
export CDK_DEFAULT_REGION=$AWS_REGION;

cdk deploy --all --require-approval never;