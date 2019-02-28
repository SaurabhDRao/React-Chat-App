import React, { Component } from 'react';
import { FaSearch, FaChevronDown } from "react-icons/fa";
import { MdMenu, MdEject } from "react-icons/md";
import { SidebarOption } from "./SidebarOption";
import { get, last, differenceBy } from "lodash";
import { createChatNameFromUsers } from "../../Factories";

class Sidebar extends Component {
    static type = {
        CHATS: "chats",
        USERS: "users"
    }
    constructor(props){
        super(props);
        this.state = {
            receiver: "",
            activeSidebar: Sidebar.type.CHATS
        };
    }

    handleSubmit = (e) => {
        e.preventDefault()
        const { receiver } = this.state;
        const { onSendPrivateMessage } = this.props;
        onSendPrivateMessage(receiver);
        this.setState({ receiver: "" });
    }

    addChatForUser = (username) => {
        this.setActiveSidebar(Sidebar.type.CHATS);
        this.props.onSendPrivateMessage(username);
    }

    setActiveSidebar = (newSidebar) => {
        this.setState({ activeSidebar: newSidebar });
    }

    render() {
        const { chats, activeChat, user, setActiveChat, logout, users } = this.props;
        const { receiver, activeSidebar } = this.state;

        return (
            <div id = "side-bar" >
                <div className="heading">
                    <div className="app-name">React Chat App <FaChevronDown /></div>
                    <div className="menu">
                        <MdMenu />
                    </div>
                </div>
                <form onSubmit = { this.handleSubmit } className="search">
                    <i className="search-icon"><FaSearch /></i>
                    <input 
                        placeholder = "Search" 
                        type = "text" 
                        value = { receiver }
                        onChange = {(e) => { this.setState({ receiver: e.target.value }) }}
                    />
                    <div className="plus"></div>
                </form>
                <div className="side-bar-select">
                    <div 
                        onClick = { () => { this.setActiveSidebar(Sidebar.type.CHATS) } }
                        className={ `side-bar-select__option ${ (activeSidebar === Sidebar.type.CHATS) ? "active" : "" }` }
                    >
                        <span>Chats</span>
                    </div>
                    <div 
                        onClick = { () => { this.setActiveSidebar(Sidebar.type.USERS) } }
                        className={ `side-bar-select__option ${ (activeSidebar === Sidebar.type.USERS) ? "active" : "" }` }
                    >
                        <span>Users</span>
                    </div>
                </div>
                <div
                    className="users"
                    ref = "users"
                    onClick = {(e) => { (e.target === this.refs.user) && setActiveChat(null) }} >
                    {
                        activeSidebar === Sidebar.type.CHATS ?
                        chats.map((chat) => {
                            if(chat.name){
                                return (
                                    <SidebarOption 
                                        key = { chat.id }
                                        name = { chat.isCommunity ? chat.name : createChatNameFromUsers(chat.users, user.name) }
                                        lastMessage = { get(last(chat.messages), "message", "") }
                                        active = { activeChat.id === chat.id }
                                        onClick = { () => { this.props.setActiveChat(chat) } }
                                    />
                                )
                            }
                            return null;
                        })
                        :
                        differenceBy(users, [user], "name").map((otherUser) => {
                            return(
                                <SidebarOption 
                                    key = { otherUser.id }
                                    name = { otherUser.name }
                                    onClick = { () => { this.addChatForUser(otherUser.name) } }
                                />
                            )
                        })
                    }
                </div>
                <div className="current-user">
                    <span>{ user.name }</span>
                    <div className="logout" title = "Logout" onClick = {() => { logout() }} >
                        <MdEject />
                    </div>
                </div>
            </div>
        )
    }
}

export default Sidebar;