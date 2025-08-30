#import "GoogleAuthModule.h"

@class GoogleAuth;

@implementation GoogleAuthModule

RCT_EXPORT_MODULE(GoogleAuth)

+ (BOOL)requiresMainQueueSetup {
    return YES; // Google Sign-In requires main queue
}

// MARK: - Configuration

RCT_EXPORT_METHOD(configure:(NSDictionary *)params
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    Class GoogleAuthClass = NSClassFromString(@"GoogleAuth");
    if (GoogleAuthClass) {
        id googleAuth = [GoogleAuthClass performSelector:@selector(shared)];
        if ([googleAuth respondsToSelector:@selector(configure:)]) {
            [googleAuth performSelector:@selector(configure:) withObject:params];
        }
    }
    resolve(nil);
}

// MARK: - Sign-in Methods

RCT_EXPORT_METHOD(signIn:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    Class GoogleAuthClass = NSClassFromString(@"GoogleAuth");
    if (GoogleAuthClass) {
        id googleAuth = [GoogleAuthClass performSelector:@selector(shared)];
        if ([googleAuth respondsToSelector:@selector(signIn:reject:)]) {
            [googleAuth performSelector:@selector(signIn:reject:) withObject:resolve withObject:reject];
        }
    }
}

RCT_EXPORT_METHOD(createAccount:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    Class GoogleAuthClass = NSClassFromString(@"GoogleAuth");
    if (GoogleAuthClass) {
        id googleAuth = [GoogleAuthClass performSelector:@selector(shared)];
        if ([googleAuth respondsToSelector:@selector(createAccount:reject:)]) {
            [googleAuth performSelector:@selector(createAccount:reject:) withObject:resolve withObject:reject];
        }
    }
}

// MARK: - Sign-out

RCT_EXPORT_METHOD(signOut:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    Class GoogleAuthClass = NSClassFromString(@"GoogleAuth");
    if (GoogleAuthClass) {
        id googleAuth = [GoogleAuthClass performSelector:@selector(shared)];
        if ([googleAuth respondsToSelector:@selector(signOut:reject:)]) {
            [googleAuth performSelector:@selector(signOut:reject:) withObject:resolve withObject:reject];
        }
    }
}

// MARK: - Token Management

RCT_EXPORT_METHOD(getTokens:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    Class GoogleAuthClass = NSClassFromString(@"GoogleAuth");
    if (GoogleAuthClass) {
        id googleAuth = [GoogleAuthClass performSelector:@selector(shared)];
        if ([googleAuth respondsToSelector:@selector(getTokens:reject:)]) {
            [googleAuth performSelector:@selector(getTokens:reject:) withObject:resolve withObject:reject];
        }
    }
}

// MARK: - Utility Methods

RCT_EXPORT_METHOD(checkPlayServices:(BOOL)showErrorDialog
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    Class GoogleAuthClass = NSClassFromString(@"GoogleAuth");
    if (GoogleAuthClass) {
        id googleAuth = [GoogleAuthClass performSelector:@selector(shared)];
        if ([googleAuth respondsToSelector:@selector(checkPlayServices:resolve:reject:)]) {
            NSMethodSignature *signature = [googleAuth methodSignatureForSelector:@selector(checkPlayServices:resolve:reject:)];
            NSInvocation *invocation = [NSInvocation invocationWithMethodSignature:signature];
            [invocation setTarget:googleAuth];
            [invocation setSelector:@selector(checkPlayServices:resolve:reject:)];
            [invocation setArgument:&showErrorDialog atIndex:2];
            [invocation setArgument:&resolve atIndex:3];
            [invocation setArgument:&reject atIndex:4];
            [invocation invoke];
        }
    }
}


@end