#import "GoogleAuthModule.h"
#import "GoogleAuth-Swift.h"

@implementation GoogleAuthModule

RCT_EXPORT_MODULE(GoogleAuth)

+ (BOOL)requiresMainQueueSetup {
    return NO;
}

RCT_EXPORT_METHOD(multiply:(double)a
                  b:(double)b
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    GoogleAuth *googleAuth = [[GoogleAuth alloc] init];
    NSNumber *result = [googleAuth multiply:a b:b];
    resolve(result);
}

@end