import React, { Component } from 'react'

class Messages extends Component {
    constructor(props) {
        super(props);
        this.scrollDown = this.scrollDown.bind(this);
    }

    scrollDown(){
        const { container } = this.refs;
        container.scrollTop = container.scrollHeight
    }

    componentDidMount(){
        this.scrollDown()
    }

    componentDidUpdate(prevProps, prevState){
        this.scrollDown()
    }

    render() {
        const { messages, user, typingUsers } = this.props;

        return (
            <div 
                ref = "container"
                className = "thread-container"    
            >
                <div className="thread">
                    {
                        messages.map((msg) => {
                            return (
                                <div
                                    key = { msg.id }
                                    className = { `message-container ${ msg.sender === user.name && "right" }` }
                                >
                                    <div className="time">{ msg.time }</div>
                                    <div className="data">
                                        <div className="message">{ msg.message }</div>
                                        <div className="name">{ msg.sender }</div>
                                    </div>
                                </div>
                            )
                        })
                    }
                    {
                        typingUsers.map((name) => {
                            return (
                                <div key = { name }  className="typing-user">
                                    { `${ name } is typing...` }
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        )
    }
}

export default Messages;