class Apizza2Apipost {
  version: string;
  project: any;
  apis: any[];
  constructor() {
    this.version = '1.0';
    this.project = {};
    this.apis = [];
  }
  ConvertResult(status: string, message: string, data: any = '') {
    return {
      status,
      message,
      data
    }
  }
  validate(json: any) {
    if (json.hasOwnProperty('version')) {
      if (json.version !== '1.0') {
        return this.ConvertResult('error', 'Must contain a apizzaProject field 1.0');
      } else {
        this.version = '2.0';
      }
    }
    if (!json.hasOwnProperty('project_info')) {
      return this.ConvertResult('error', 'Must contain a apizzaProject field 1.0');
    }

    return this.ConvertResult('success', '');
  }
  handleInfo(json: any) {
    this.project.name = json?.project_info?.name || '新建项目';
    this.project.description = json?.project_info?.comment || '';
  }
  createNewApi(item: any) {
    const { api: foxApi } = item;
    var api: any = {
      name: item.name || '新建接口',
      target_type: 'api',
      url: foxApi.path || "",
      method: foxApi.method.toUpperCase() || 'GET',
      request: {
        'query': [],
        'header': [],
        'description': foxApi.description || '',
      }
    }
    const { request } = api;
    if (foxApi.hasOwnProperty('parameters')) {
      for (const key in foxApi.parameters) {
        let item = foxApi.parameters[key];
        if (key == 'query') {
          item.name && request.query.push({
            is_checked: "1",
            type: 'Text',
            key: item.name,
            value: item.sampleValue || '',
            not_null: "1",
            description: item.description || '',
            field_type: "Text"
          });
        } else if (key == 'header') {
          item.name && request.header.push({
            is_checked: "1",
            type: 'Text',
            key: item.name,
            value: item.sampleValue || '',
            not_null: "1",
            description: item.description || '',
            field_type: "Text"
          });
        }
      }
    }
    if (foxApi.hasOwnProperty('auth')) {
      // 全证
      let apiPostAuth = {
        type: 'noauth',
        kv: {
          key: '',
          value: '',
        },
        bearer: {
          key: ''
        },
        basic: {
          username: '',
          password: ''
        }
      }
      const { auth } = foxApi;
      if (auth) {
        let type = auth['type'] || 'noauth';
        let apikey = auth['apikey'];
        let bearer = auth['bearer'];
        let basic = auth['basic'];
        switch (type) {
          case 'apikey':
            type = 'kv';
            break;
          case 'bearer':
            type = 'bearer';
            break;
          case 'basic':
            type = 'basic';
            break;
          default:
            type = 'noauth';
            break;
        }
        apiPostAuth.type = type;
        if (apikey) {
          apiPostAuth.kv = {
            key: apikey['key'] || '',
            value: apikey['value'] || ''
          }
        }
        if (bearer) {
          apiPostAuth.bearer = {
            key: bearer['token'] || '',
          }
        }
        if (basic) {
          apiPostAuth.basic = {
            username: basic['username'] || '',
            password: basic['password'] || ''
          }
        }
        request['auth'] = apiPostAuth;
      }
    }
    if (foxApi.hasOwnProperty('requestBody')) {
      request.body = {
        "mode": "none",
        "parameter": [],
        "raw": '',
        "raw_para": []
      }
      if (foxApi.requestBody['type'] == 'application/x-www-form-urlencoded') {
        request.body.mode = 'urlencoded';
        if (foxApi.requestBody.hasOwnProperty('parameters') && foxApi.requestBody.parameters instanceof Array) {
          foxApi.requestBody.parameters.forEach((param: any) => {
            param.name && request.body.parameter.push(
              {
                is_checked: "1",
                type: 'Text',
                key: param.name || "",
                value: param.sampleValue || "",
                not_null: "1",
                description: param.description || "",
                field_type: "Text"
              })
          });
        }
      } else if (foxApi.requestBody['type'] == 'multipart/form-data') {
        request.body.mode = 'form-data';
        if (foxApi.requestBody.hasOwnProperty('parameters') && foxApi.requestBody.parameters instanceof Array) {
          foxApi.requestBody.parameters.forEach((param: any) => {
            param.name && request.body.parameter.push(
              {
                is_checked: "1",
                type: param['type'] && param['type'] == 'file' ? 'File' : 'Text',
                key: param.name || "",
                value: param.sampleValue || "",
                not_null: "1",
                description: param.description || "",
                field_type: "Text"
              })
          });
        }
      }else{
        request.body.raw=foxApi.requestBody.sampleValue || '';
      }
    }
    return api;
  }
  createNewFolder(item: any) {
    var newFolder: any = {
      'name': item.name || '新建目录',
      'target_type': 'folder',
      'description': item.description || '',
      'children': [],
    };
    // 全证
    let apiPostAuth = {
      type: 'noauth',
      kv: {
        key: '',
        value: '',
      },
      bearer: {
        key: ''
      },
      basic: {
        username: '',
        password: ''
      }
    }
    const { auth } = item;
    if (auth) {
      let type = auth['type'] || 'noauth';
      let apikey = auth['apikey'];
      let bearer = auth['bearer'];
      let basic = auth['basic'];
      switch (type) {
        case 'apikey':
          type = 'kv';
          break;
        case 'bearer':
          type = 'bearer';
          break;
        case 'basic':
          type = 'basic';
          break;
        default:
          type = 'noauth';
          break;
      }
      apiPostAuth.type = type;
      if (apikey) {
        apiPostAuth.kv = {
          key: apikey['key'] || '',
          value: apikey['value'] || ''
        }
      }
      if (bearer) {
        apiPostAuth.bearer = {
          key: bearer['token'] || '',
        }
      }
      if (basic) {
        apiPostAuth.basic = {
          username: basic['username'] || '',
          password: basic['password'] || ''
        }
      }
      newFolder['auth'] = apiPostAuth;
    }
    return newFolder;
  }
  handleApiAndFolder(items: any[], parent: any = null) {
    var root = this;
    for (const item of items) {
      let target;
      if (item.hasOwnProperty('items') && !item.hasOwnProperty('api')) {
        target = root.createNewFolder(item);
        root.handleApiAndFolder(item.items, target);
      }
      if (item.hasOwnProperty('api')) {
        target = root.createNewApi(item);
      }
      if (parent && parent != null) {
        parent.children.push(target);
      } else {
        root.apis.push(target);
      }
    }
  }
  handleApiCollection(json: any) {
    if (!json.hasOwnProperty('categorys')) {
      return;
    }
    let categorys = json.categorys;
    if (categorys instanceof Array && categorys.length > 0) {
      if (categorys[0].hasOwnProperty('items')) {
        this.handleApiAndFolder(categorys[0].items, null);
      }
    }
  }
  convert(json: object) {
    var validationResult = this.validate(json);
    if (validationResult.status === 'error') {
      return validationResult;
    }
    this.handleInfo(json);
    this.handleApiCollection(json);
    validationResult.data = {
      project: this.project,
      apis: this.apis
    }
    console.log('project', JSON.stringify(validationResult));
    return validationResult;
  }
}

export default Apizza2Apipost;
