# CDK Commands For This Stack

## Prerequisites
Set the account and region environment variables.

### To reuse from sourced credentials
```sh
export CDK_DEFAULT_ACCOUNT=$AWS_ACCOUNT_ID;
export CDK_DEFAULT_REGION=$AWS_REGION;
```

### Hardcoded also works
```sh
export CDK_DEFAULT_ACCOUNT='123456789012';
export CDK_DEFAULT_REGION='us-east-2';
```

## Deploy (Create/Update)
cdk deploy --all --require-approval never

## Destroy (Delete)
cdk destroy --all -f