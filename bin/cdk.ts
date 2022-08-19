#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { HelloHelmStack } from '../lib';

const internetAccess = (process.env.INTERNET_ACCESS?.toLowerCase() == "true") || true
const stackName = process.env.STACK_NAME || 'HelloHelmStack'

const app = new cdk.App();
new HelloHelmStack(app, stackName, {
  internetAccess: internetAccess,
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION 
  }
});