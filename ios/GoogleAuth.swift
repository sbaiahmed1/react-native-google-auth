import Foundation

@objc(GoogleAuth)
public class GoogleAuth: NSObject {
    
    @objc
    public func multiply(_ a: Double, b: Double) -> NSNumber {
        let result = a * b
        return NSNumber(value: result)
    }
}