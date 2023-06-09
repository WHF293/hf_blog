
## ts 装饰器

### 函数装饰器

装饰器是一种特殊类型的声明，它可以被附加到类声明、方法、属性或参数上，以修改类的行为。装饰器使用 @expression 的形式，其中 expression 求值后必须是一个函数，它会在运行时被调用，以便对类进行处理。

装饰器可以用于许多不同的场景，例如：

添加元数据：可以使用装饰器将元数据附加到类、方法、属性或参数上。这些元数据可以在运行时使用，以便进行诸如验证、序列化等操作。
修改类的行为：可以使用装饰器来修改类的行为，例如添加新的方法、属性或修改现有的方法、属性。
依赖注入：可以使用装饰器来实现依赖注入，以便在运行时自动注入依赖项。
以下是一个使用装饰器的 TypeScript 示例：


```ts

/**
 * @params {function} target：装饰器的目标对象。在这个示例中，它指的是 MyClass 类的原型。
 * @params {string} key：被装饰属性的名称。在这个示例中，它指的是 myMethod 方法的名称。
 * @params {PropertyDescriptor} descriptor：一个对象，它包含被装饰属性的属性描述符。属性描述符是一个对象，它描述了属性的特性，例如它是否可写、可枚举或可配置。在这个示例中，descriptor 对象被用来修改 myMethod 方法的行为，通过替换原始实现为一个新的实现，该实现会记录方法的参数和返回值
 * */
function log(target: any, key: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function(...args: any[]) {
    console.log(`Calling ${key} with`, args);
    const result = originalMethod.apply(this, args);
    console.log(`Result is`, result);
    return result;
  };

  return descriptor;
}

class MyClass {
  @log
  myMethod(arg1: string, arg2: number) {
    console.log(`myMethod called with ${arg1} and ${arg2}`);
    return 'done';
  }
}

const myInstance = new MyClass();
myInstance.myMethod('hello', 42);
```

在这个示例中，我们定义了一个名为 log 的装饰器函数，它会在调用 myMethod 方法时打印日志。我们将 log 装饰器应用于 myMethod 方法，这样每次调用 myMethod 时都会自动打印日志。

### 类装饰器

在 TypeScript 中，类装饰器是一种特殊类型的装饰器，它可以被附加到类声明上，以修改类的行为。

类装饰器接受一个参数，它是一个函数，该函数会在类被声明时被调用，以便对类进行处理。

类装饰器可以用于许多不同的场景，例如：

添加元数据：可以使用类装饰器将元数据附加到类上。这些元数据可以在运行时使用，以便进行诸如验证、序列化等操作。
修改类的行为：可以使用类装饰器来修改类的行为，例如添加新的方法、属性或修改现有的方法、属性。
依赖注入：可以使用类装饰器来实现依赖注入，以便在运行时自动注入依赖项。
以下是一个使用类装饰器的 TypeScript 示例：

```ts
function log(target: any) {
  console.log(`Class ${target.name} is declared`);
}

@log
class MyClass {
  myMethod() {
    console.log(`myMethod is called`);
  }
}

const myInstance = new MyClass();
myInstance.myMethod();
```

在这个示例中，我们定义了一个名为 log 的类装饰器函数，它会在声明 MyClass 类时打印日志。我们将 log 装饰器应用于 MyClass 类，这样每次声明 MyClass 类时都会自动打印日志。

### 参数装饰器

在 TypeScript 中，参数装饰器是一种特殊类型的装饰器，它可以被附加到函数或方法的参数上，以修改函数或方法的行为。参数装饰器接受三个参数：

- target：被装饰参数所属的对象。在函数中，它指的是函数的原型；在方法中，它指的是类的原型。
- propertyKey：被装饰参数所属的方法或属性的名称。
- parameterIndex：被装饰参数的索引。
参数装饰器可以用于许多不同的场景，例如：

添加元数据：可以使用参数装饰器将元数据附加到函数或方法的参数上。这些元数据可以在运行时使用，以便进行诸如验证、序列化等操作。
修改函数或方法的行为：可以使用参数装饰器来修改函数或方法的行为，例如添加新的参数或修改现有的参数。
以下是一个使用参数装饰器的 TypeScript 示例：

```ts
function logParameter(
    target: any, 
    propertyKey: string, 
    parameterIndex: number
) {
  console.log(
    `Parameter ${parameterIndex} of ${propertyKey} 
    in ${target.constructor.name} is decorated`
  );
}

class MyClass {
  myMethod(
    @logParameter arg1: string, 
    @logParameter arg2: number
  ) {
    console.log(`myMethod called with ${arg1} and ${arg2}`);
  }
}

const myInstance = new MyClass();
myInstance.myMethod('hello', 42);
```

在这个示例中，我们定义了一个名为 logParameter 的参数装饰器函数，它会在调用 myMethod 方法时打印日志。我们将 logParameter 装饰器应用于 myMethod 方法的两个参数，这样每次调用 myMethod 时都会自动打印日志。