import React, { PureComponent } from "react";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
// 设置高亮样式
import { okaidia } from "react-syntax-highlighter/dist/esm/styles/prism";
// 设置高亮的语言
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";

interface IProps {
  language: string,
  value: string
}

class CodeBlock extends PureComponent<IProps> {

  UNSAFE_componentWillMount() {
    // 注册要高亮的语法，
    // 注意：如果不设置打包后供第三方使用是不起作用的
    SyntaxHighlighter.registerLanguage("javascript", javascript);
    SyntaxHighlighter.registerLanguage("js", javascript);
  }

  render() {
    const { language, value } = this.props;
    return (
      <SyntaxHighlighter language={language} style={okaidia}>
        {value}
      </SyntaxHighlighter>
    );
  }
}
export default CodeBlock;