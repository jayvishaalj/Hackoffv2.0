import React, { Component } from 'react';
import './App.css';
import logo from './FRIDAY.jpg';
import { Container, Row, Col, Navbar } from "react-bootstrap";
import Editor from "@monaco-editor/react";
import Iframe from 'react-iframe';
//import Speech from 'react-speech';
import Artyom from 'artyom.js';
import axois from 'axios';
//import SpeechToText from 'speech-to-text';
//import SpeechRecognition from 'react-speech-recognition';


const friday = new Artyom();

class App extends Component {


  constructor(props) {
    super(props);
    this.valueGetter = React.createRef();
    this.state = {
      codeValue: "#write your code here \n",
      importCommands: "import matplotlib.pyplot as plt \n from mpl_toolkits.mplot3d import Axes3D \n from sklearn import datasets\n from sklearn.decomposition import PCA",
      importStatement: "",
      load: "",
      preProcessing: "",
      model: "",
      result: "",
      recognizedText: "Speak something! Start it with Wake word Friday !!!",
      imported: false,
      listening: true,
      guideUrl: "https://scikit-learn.org/stable/user_guide.html",
      guideNeeded: false,
      runOutput: ""

    }
  }


  componentWillMount() {
    this.setState({
      codeValue: this.state.importStatement + this.state.load + this.state.preProcessing + this.state.model + this.state.result
    });
    friday.ArtyomVoicesIdentifiers["en-GB"] = ["Google UK English Female", "Google UK English Male", "en-GB", "en_GB"];

    friday.redirectRecognizedTextOutput((recognized, isFinal) => {
      if (isFinal) {
        console.log("Sending text" + recognized)
        let apiUrl = 'http://5c972537.ngrok.io/api/getText/' + recognized
        axois.get(apiUrl)
          .then(response => {
            console.log(response.data);
            if (response.status === 200) {
              console.log("STATUS OK");
              let jsondata = response.data;
              let phase = jsondata.result[0][0];
              let codesnip = jsondata.result[0][2];
              let imports = jsondata.result[0][3];
              let urls = jsondata.result[0][4];
              console.log(imports + "   :    " + codesnip);
              this.setState({
                importStatement: this.state.importStatement + imports,
                guideUrl: urls,
                guideNeeded: true
              });
              let apiUrl = 'http://5c972537.ngrok.io/api/interpreter/' + imports;
              axois.get(apiUrl)
                .then(response => {
                  console.log(response.data.value);
                  console.log("STATUS OK INTERPRETER");
                  console.log(response.data.value);
                  let res = response.data.result;
                  let link = response.data.value;
                  console.log(link);
                  if (res.localeCompare("error")) {
                    this.setState({
                      seenError: true,
                      runOutput: link
                    })
                  }
                })
                .catch(err => {
                  console.log(err);
                })

              if (phase.localeCompare("model") === 0) {
                this.setState({
                  model: this.state.model + codesnip
                });
              }
              else if (phase.localeCompare("process") === 0) {
                this.setState({
                  preProcessing: this.state.preProcessing + codesnip
                });
                let apiUrl = 'http://5c972537.ngrok.io/api/interpreter/' + codesnip;
                axois.get(apiUrl)
                  .then(response => {
                    console.log(response.data);
                    if (response.status === 200) {
                      console.log("STATUS OK INTERPRETER");
                      console.log(response.data);
                    }
                  })
                  .catch(err => {
                    console.log(err);
                  })

              }
              else if (phase.localeCompare("load") === 0) {
                this.setState({
                  load: this.state.load + codesnip
                });
                let apiUrl = 'http://5c972537.ngrok.io/api/interpreter/' + codesnip;
                axois.get(apiUrl)
                  .then(response => {
                    console.log(response.data);
                    if (response.status === 200) {
                      console.log("STATUS OK INTERPRETER");
                      console.log(response.data);
                    }
                  })
                  .catch(err => {
                    console.log(err);
                  })
              }
              else if (phase.localeCompare("result") === 0) {
                this.setState({
                  result: this.state.resutl + codesnip
                });
              }
            }
            this.setState({
              codeValue: this.state.importStatement + "\n" + this.state.load + "\n" + this.state.preProcessing + "\n" + this.state.model + "\n" + this.state.result
            });
          })
          .catch(err => {
            console.log(err);
          })

        this.setState({
          recognizedText: "speak Something !! Start it with Wake word Friday !!!"
        });

      } else {
        this.setState({
          recognizedText: recognized,
        });
      }
    });
    // Add command (Short code artisan way)
    friday.on(['good morning', 'Good afternoon', 'morning']).then((i) => {
      switch (i) {
        case 0:
        case 2:
          friday.say("Good morning, how are you?");
          break;
        case 1:
          friday.say("Good afternoon, how are you?");
          break;
        default:
          friday.say("Hi , i am your coding assistant");
      }
    });

    // Smart command (Short code artisan way), set the second parameter of .on to true
    friday.on(['Repeat after me *'], true).then((i, wildcard) => {
      friday.say("You've said : " + wildcard);
    });

    // or add some commandsDemostrations in the normal way
    friday.addCommands([
      {
        indexes: ['bringup import statements', 'add import statements', 'ad import statements', 'bring up import statements', 'bring up import *'],
        action: (i, wildcard) => {
          console.log("import part");
          if (this.state.imported === false) {
            friday.say("importing libraries", {
              onEnd: () => {

                this.setState(
                  {
                    codeValue: this.state.codeValue + this.state.importCommands,
                    imported: true
                  }
                );
              }
            });
          }
          else {
            friday.say("already Imported Sir !!")
          }
        }
      },
      {
        indexes: ['run code', 'Run code'],
        action: (i, wildcard) => {
          friday.say("Executing the code in server");
          let apiUrl = 'http://5c972537.ngrok.io/api/runCode';
          axois.post(apiUrl, {
            "code": this.valueGetter.current()
          })
            .then(response => {
              console.log(response.data);
              if (response.status === 200) {
                console.log("STATUS OK");
                console.log(response.data.value);
                let link = response.data.value;
                console.log(link);
                this.setState({
                  runOutput: response.data.value
                });
                console.log(" OUTPUT : "+this.state.runOutput);



                friday.say("Your output is ready , scroll down to view it ");
                friday.say("Result is " + this.state.runOutput);
              }
            })
            .catch(err => {
              console.log(err);
            })
        }
      },
      {
        indexes: ['fetch data from kaggle', 'which data from kaggle'],
        action: (i, wildcard) => {
          console.log('fetching webpage from kaggle');
          friday.say("Fetching the dataset webpage in the guide section")
          this.setState({
            guideUrl: "https://www.google.co.in"
          });

        }
      },
      {
        indexes: ['clean code', 'clear code', 'Clean code', 'Create new file', 'Clear code'],
        action: (i, wildcard) => {
          console.log("Clearing Code ");
          friday.say("Clearing Code ", {
            onEnd: () => {
              this.setState(
                {
                  codeValue: "// write your code here",
                  importStatement: "",
                  load: "",
                  preProcessing: "",
                  model: "",
                  result: "",
                  guideUrl: "https://scikit-learn.org/stable/user_guide.html"
                }
              );
            }
          });
        }
      },
      {
        indexes: ['show code', 'so good'],
        action: (i, wildcard) => {
          friday.say("Showing Code Sir!", {
            onEnd: () => {
              this.handleShowValue();
            }
          });
        }
      },
      {
        indexes: ['show alert'],
        action: (i, wildcard) => {
          friday.say("Calling Alert!", {
            onEnd: () => {
              console.log("show alert ");
              alert(" Hello Sir !");
            }
          });
        }
      },
      {
        indexes: ['shutdown yourself'],
        action: (i, wildcard) => {
          friday.say("Okay sir, Bye!!");
          friday.fatality().then(() => {
            console.log("friday succesfully stopped");
          });
        }
      },
    ]);
    friday.initialize({

      lang: "en-GB", // GreatBritain english
      continuous: true, // Listen forever
      soundex: true,// Use the soundex algorithm to increase accuracy
      executionKeyword: "and do it now",
      listen: true, // Start to listen commands !


      // If providen, you can only trigger a command if you say its name
      // e.g to trigger Good Morning, you need to say "Jarvis Good Morning"

    }).then(() => {

      console.log("friday has been succesfully initialized");

    }).catch((err) => {
      console.error("friday couldn't be initialized: ", err);
    });
    friday.say("Hi, I am your Coding Assistant");
  }

  handleEditorDidMount = (_valueGetter) => {
    this.valueGetter.current = _valueGetter;
  }

  speak = () => {
    friday.say("Hi sir");
  }


  handleShowValue = () => {
    console.log(this.valueGetter.current());
  }

  render() {
    if (!this.state.guideNeeded) {
      return (
        <div className="App">
          <div className="App-titleheader">

            <Navbar bg="dark" variant="dark">
              <Navbar.Brand href="#home">
                <Container>
                  <Row>
                    <Col>
                      <img
                        alt=""
                        src={logo}
                        width="100"
                        height="100"
                        className="d-inline-block align-top"
                      />{''}
                    </Col>
                    <Col>
                      <Row>
                        <h1>F.R.I.D.A.Y.</h1><h5>(Female Replacement Intelligent Digital Assistant Youth)</h5>
                      </Row>
                      <Row>
                        An NLP Based DataScience Coding Assistant for the Dyslexic
              </Row>
                    </Col>
                  </Row>
                </Container>
              </Navbar.Brand>
            </Navbar>
          </div>
          <br />
          <input type="text" id="ip2" value={this.state.recognizedText} />
          <br />
          <br />
          <header className="App-header1-start">
            <Editor
              height="70vh"
              language="python"
              theme="vs-dark"
              options={{
                acceptSuggestionOnCommitCharacter: true,
                acceptSuggestionOnEnter: "on",
                accessibilitySupport: "auto",
                autoIndent: false,
                automaticLayout: true,
                codeLens: true,
                colorDecorators: true,
                contextmenu: true,
                cursorBlinking: "blink",
                cursorSmoothCaretAnimation: false,
                cursorStyle: "line",
                disableLayerHinting: false,
                disableMonospaceOptimizations: false,
                dragAndDrop: false,
                fixedOverflowWidgets: false,
                folding: true,
                foldingStrategy: "auto",
                fontLigatures: false,
                formatOnPaste: false,
                formatOnType: false,
                hideCursorInOverviewRuler: false,
                highlightActiveIndentGuide: true,
                links: true,
                quickSuggestions: true,
                quickSuggestionsDelay: 100,
                readOnly: false,
                renderControlCharacters: false,
                renderFinalNewline: true,
                renderIndentGuides: true,
                renderLineHighlight: "all",
                renderWhitespace: "none",
                revealHorizontalRightPadding: 30,
                roundedSelection: true,
                rulers: [],
                scrollBeyondLastColumn: 5,
                scrollBeyondLastLine: true,
                selectOnLineNumbers: true,
                selectionClipboard: true,
                selectionHighlight: true,
                showFoldingControls: "mouseover",
                smoothScrolling: false,
                suggestOnTriggerCharacters: true,
                wordBasedSuggestions: false,
                wordSeparators: "~!@#$%^&*()-=+[{]}|;:'\",.<>/?",
                wordWrap: "off",
                wordWrapBreakAfterCharacters: "\t})]?|&,;",
                wordWrapBreakBeforeCharacters: "{([+",
                wordWrapBreakObtrusiveCharacters: ".",
                wordWrapColumn: 80,
                wordWrapMinified: true,
                wrappingIndent: "none"
              }}
              value={this.state.codeValue}
            //editorDidMount={this.handleEditorDidMount.bind(this)}
            />
          </header>
        </div>
      );
    }
    else {
      return (
        <div className="App">
          {/* <Col>
                    <img
                      alt=""
                      src={logo}
                      width="100"
                      height="100"
                      className="d-inline-block align-top"
                    />{''}
                  </Col> */}
          <Navbar bg="dark" variant="dark">
            <Navbar.Brand href="#home">
              <Container>
                <Row>
                  <Col>
                    <img
                      alt=""
                      src={logo}
                      width="100"
                      height="100"
                      className="d-inline-block align-top"
                    />{''}
                  </Col>
                  <Col>
                    <Row>
                      <h1>F.R.I.D.A.Y.</h1>
                    </Row>
                    <Row>
                      Female Replacement Intelligent Digital Assistant Youth
              </Row>
                    <Row>
                      An NLP Based DataScience Coding Assistant for the Dyslexic
              </Row>
                  </Col>
                </Row>
              </Container>
            </Navbar.Brand>
          </Navbar>
          <br />
          <input type="text" id="ip2" value={this.state.recognizedText} />
          <br />
          <br />
          <Container>
            <Row>
              <Col sm={6}>
                <header className="App-header1">
                  <Editor
                    height="85vh"
                    language="python"
                    theme="vs-dark"
                    options={{
                      acceptSuggestionOnCommitCharacter: true,
                      acceptSuggestionOnEnter: "on",
                      accessibilitySupport: "auto",
                      autoIndent: false,
                      automaticLayout: true,
                      codeLens: true,
                      colorDecorators: true,
                      contextmenu: true,
                      cursorBlinking: "blink",
                      cursorSmoothCaretAnimation: false,
                      cursorStyle: "line",
                      disableLayerHinting: false,
                      disableMonospaceOptimizations: false,
                      dragAndDrop: false,
                      fixedOverflowWidgets: false,
                      folding: true,
                      foldingStrategy: "auto",
                      fontLigatures: false,
                      formatOnPaste: false,
                      formatOnType: false,
                      hideCursorInOverviewRuler: false,
                      highlightActiveIndentGuide: true,
                      links: true,
                      quickSuggestions: true,
                      quickSuggestionsDelay: 100,
                      readOnly: false,
                      renderControlCharacters: false,
                      renderFinalNewline: true,
                      renderIndentGuides: true,
                      renderLineHighlight: "all",
                      renderWhitespace: "none",
                      revealHorizontalRightPadding: 30,
                      roundedSelection: true,
                      rulers: [],
                      scrollBeyondLastColumn: 5,
                      scrollBeyondLastLine: true,
                      selectOnLineNumbers: true,
                      selectionClipboard: true,
                      selectionHighlight: true,
                      showFoldingControls: "mouseover",
                      smoothScrolling: false,
                      suggestOnTriggerCharacters: true,
                      wordBasedSuggestions: false,
                      wordSeparators: "~!@#$%^&*()-=+[{]}|;:'\",.<>/?",
                      wordWrap: "off",
                      wordWrapBreakAfterCharacters: "\t})]?|&,;",
                      wordWrapBreakBeforeCharacters: "{([+",
                      wordWrapBreakObtrusiveCharacters: ".",
                      wordWrapColumn: 80,
                      wordWrapMinified: true,
                      wrappingIndent: "none"
                    }}

                    value={this.state.codeValue}
                    editorDidMount={this.handleEditorDidMount.bind(this)}
                  />
                </header>
              </Col>
              <Col sm={6}>
                <Iframe url={this.state.guideUrl}
                  width="650px"
                  height="550px"
                  id="myId"
                  scrolling="yes"
                  className="App-guide" />

              </Col>
            </Row>
            <Row>
              <h3 className="App-outputText">OUTPUT : {this.state.runOutput} </h3>
            </Row>
          </Container>
        </div>
      );
    }

  }

}

export default App;
