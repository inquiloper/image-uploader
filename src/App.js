import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Alert, Button, Col, Container, Overlay, Row, Tooltip } from 'react-bootstrap';
import placeholder from './assets/placeholder-image.png';
import { CheckCircleFill } from 'react-bootstrap-icons';

class App extends React.Component{

    constructor(props) {
        super(props);
        this.dropZone = React.createRef();
        this.fileInput = React.createRef();
        this.copyLinkButton = React.createRef();

        this.setupDropZone = this.setupDropZone.bind(this);
        this.handleDrop = this.handleDrop.bind(this);
        this.highlight = this.highlight.bind(this);
        this.unhighlight = this.unhighlight.bind(this);
        this.uploadData = this.uploadData.bind(this);
        this.handleFileSelection = this.handleFileSelection.bind(this);
        this.validateFiles = this.validateFiles.bind(this);
        this.handleCopyLinkButton = this.handleCopyLinkButton.bind(this);

        this.state = {
            uploading: false,
            showingDropZone: true,
            uploadProgress: 0,
            uploadSuccessful: false,
            lastImageUploadedUrl: "",
            error: false,
            showCopiedTooltip: true
        };

        this.endpoint = process.env.REACT_APP_BACKEND_URL;
    }

    componentDidMount() {
        this.setupDropZone();
    }

    setupDropZone() {
        ['dragenter', 'dragover'].forEach(eventName => {
            this.dropZone.current.addEventListener(eventName, this.highlight, false)
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.dropZone.current.addEventListener(eventName, this.unhighlight, false)
        });

        this.dropZone.current.addEventListener('drop', this.handleDrop, false)

    }

    highlight(e) {
        e.preventDefault();
    }

    unhighlight(e) {
        e.preventDefault();
    }

    handleFileSelection(e) {
        e.preventDefault();
        this.validateFiles(this.fileInput.current.files);
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        let dt = e.dataTransfer;
        let files = dt.files;
        this.validateFiles(files);
    }

    validateFiles(files) {
        const allowedFiles = ["image/png", "image/jpg", "image/jpeg"];
        let formFiles = new FormData();

        [...files].forEach((file) => {
            if (allowedFiles.includes(file.type)) {
                formFiles.append('file', file);
            } else {
                console.log('file not allowed!')
                this.setState({error: `The filetype ${file.type} is not allowed`});
                return;
            }
        });

        if (formFiles.getAll('file').length > 0) {
            this.uploadData(formFiles);
        }
    }

    uploadData(data) {

        this.setState({uploading: true, showingDropZone: false}, () => {
            let xhr = new XMLHttpRequest();
            xhr.open("POST", this.endpoint);
            xhr.send(data);
    
            xhr.addEventListener("load", () => {
                this.setState({uploadSuccessful: true, uploadProgress: 0, uploading: false, showingDropZone: false})
            });
    
            xhr.addEventListener("loadend", () => {

                let response = JSON.parse(xhr.responseText);

                if (response.imageUrl) {
                    this.setState({lastImageUploadedUrl: response.imageUrl});
                }
            });
    
            xhr.addEventListener("error", () => console.log('error()'));

            xhr.addEventListener("progress", (e) => {
                let progressSoFar = (e.loaded / e.total) * 100;
                this.setState({uploadProgress: progressSoFar});
            })
        });
    }

    handleCopyLinkButton(e) {
        e.preventDefault();
        navigator.clipboard.writeText(this.state.lastImageUploadedUrl);
        this.setState({showCopiedTooltip: true});
    }

    render() {
        const {
            uploading, 
            showingDropZone, 
            uploadProgress, 
            uploadSuccessful, 
            lastImageUploadedUrl,
            error,
            showCopiedTooltip
        } = this.state;

        return (
          <>
              <Container className="h-100 vh-100">
                  <Row className="h-100 justify-content-center align-items-center">
                      <Col sm="6" id="center-card">

                            {error && 
                                <Alert onClose={() => this.setState({error: false})} variant="danger" dismissible>
                                    <Alert.Heading>Oh no! An error has ocurred</Alert.Heading>
                                    <p className="text-muted">{error}</p>
                                </Alert>
                            }
                            {showingDropZone && 
                                <div id="drop-container">
                                    <Row>
                                        <Col>
                                            <h5 className="text-center">Upload your image</h5>
                                        </Col>
                                    </Row>
                                    <Row className="mt-4 mb-4">
                                        <Col>
                                            <p className="text-muted text-center">File should be Jpeg, Png...</p>
                                        </Col>
                                    </Row>
                                    <Row id="drop-zone" ref={this.dropZone} onDragOver={() => null}>
                                        <Col className="">
                                            <Row>
                                                <Col className="text-center">
                                                    <img className="text-center" src={placeholder}/>
                                                </Col>
                                            </Row>
                                            <Row className="mt-5">
                                                <Col>
                                                    <h6 className="text-muted text-center">Drag & Drop your image here</h6>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                    <Row className="mt-3">
                                        <Col className="d-flex justify-content-center">
                                            <p className="text-muted">Or</p>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col className="d-flex justify-content-center">
                                            <Button onClick={() => this.fileInput.current.click()}>Choose a file</Button>
                                            <input onChange={this.handleFileSelection} ref={this.fileInput} type="file"  style={{display: 'none'}}/> 
                                        </Col>
                                    </Row>
                                </div>
                            }
                            {!showingDropZone && uploading && 
                                <div id="upload-progress-container">
                                    <Row>
                                        <Col>
                                            <h3>Uploading..</h3>
                                        </Col>
                                    </Row>
                                    <Row className="mt-4">
                                        <Col>
                                        <div className="progress">
                                            <div className="progress-bar" role="progressbar" style={{"width": `${uploadProgress}%`}} aria-valuenow={uploadProgress} aria-valuemin="0" aria-valuemax="100">{uploadProgress}%</div>
                                        </div>
                                        </Col>
                                    </Row>
                                </div>
                            }
                            {uploadSuccessful &&
                                <>
                                    <Row>
                                        <Col className="text-center">
                                            <CheckCircleFill color="green" size="42"/>
                                        </Col>
                                    </Row>
                                    <Row className="mt-3">
                                        <Col>
                                            <h3 className="text-center">Uploaded Successfully!</h3>
                                        </Col>
                                    </Row>
                                    <Row className="mt-4">
                                        <Col id="result-image-container">
                                            <img src={lastImageUploadedUrl}/>
                                        </Col>
                                    </Row>

                                    <Row className="mt-4">
                                        <Col id="copy-link-container" className="d-flex justify-content-between">
                                            <p className="align-self-center">{lastImageUploadedUrl.substr(0, 50)} ...</p>
                                            <Button onClick={this.handleCopyLinkButton}>Copy link</Button>
                                        </Col>
                                    </Row>
                                </>
                            }
                      </Col>
                  </Row>
              </Container>
          </>
        );
    }
}

export default App;
