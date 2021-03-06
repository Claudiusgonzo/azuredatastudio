/**
 * Dusky API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: v1
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


export class DuskyObjectModelsDockerSpec {
    'registry'?: string;
    'repository'?: string;
    'imagePullPolicy'?: DuskyObjectModelsDockerSpec.ImagePullPolicyEnum;
    'imagePullSecret'?: string;
    'imageTagSuffix'?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "registry",
            "baseName": "registry",
            "type": "string"
        },
        {
            "name": "repository",
            "baseName": "repository",
            "type": "string"
        },
        {
            "name": "imagePullPolicy",
            "baseName": "imagePullPolicy",
            "type": "DuskyObjectModelsDockerSpec.ImagePullPolicyEnum"
        },
        {
            "name": "imagePullSecret",
            "baseName": "imagePullSecret",
            "type": "string"
        },
        {
            "name": "imageTagSuffix",
            "baseName": "imageTagSuffix",
            "type": "string"
        }    ];

    static getAttributeTypeMap() {
        return DuskyObjectModelsDockerSpec.attributeTypeMap;
    }
}

export namespace DuskyObjectModelsDockerSpec {
    export enum ImagePullPolicyEnum {
        IfNotPresent = <any> 'IfNotPresent',
        Always = <any> 'Always',
        Never = <any> 'Never'
    }
}
