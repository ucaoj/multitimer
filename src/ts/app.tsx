import React, { useEffect } from "react";
import ReactDOMClient from "react-dom/client";
import { ChakraProvider, Flex, Spacer, Box, Button, 
    Tabs, TabList, TabPanels, Tab, TabPanel, 
    useDisclosure, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, 
    FormControl, FormLabel, Input, FormErrorMessage,
    Checkbox } from '@chakra-ui/react';
import { register, signin, logout } from './recorder';
import { TimerWithButton } from "./timer";
import { RecordPanel } from './recordPanel';

const App = (): JSX.Element => {
    const { isOpen, onOpen, onClose } = useDisclosure(); 
    const [show, setShow] = React.useState(false);
    const [isLoggedin, setIsLoggedin] = React.useState(undefined as string);
    const [isin, setIsin] = React.useState(true);
    const [submitIn, setSubmitIn] = React.useState("NONE");
    const [username, setUsername] = React.useState("");
    const [pwd, setPwd] = React.useState("");
    const [isInvalid, setIsInvalid] = React.useState(false);
    const [errMes, setErrMes] = React.useState("");
    const handleCheck = (e) => setShow(s => !s)
    const handleChangeName = (e) => setUsername(e.target.value);
    const handleChangePwd = (e) => setPwd(e.target.value);
    const handleSignState =() => {
        console.log("sign");
        if(!isLoggedin) onOpen(); 
        else{
            logout(isLoggedin);
            setIsLoggedin(undefined);
        }
    };

    useEffect(() => {
        console.log("useeffect of App")
        if(submitIn === "NONE") return;
        if(submitIn === "IN") {
            handleSignIn();
        }
        else if(submitIn === "UP") {
            handleSignUp();
        }
        else {}
        setSubmitIn("NONE");
    }, [submitIn]);

    const handleSignIn = async () => {
        console.log("signin")
        setIsin(true); 
        const [success, mes] = await signin(username, pwd);
        console.log(success, mes)
        if(success) setIsLoggedin(username);
        setIsInvalid(!success); 
        setErrMes(success?"":mes);
    }

    const handleSignUp = async () => {
        console.log("signup...")
        setIsin(false);
        const [success, mes] = await register(username, pwd);
        console.log("done register");
        if(success) setIsLoggedin(username);
        setIsInvalid(!success); 
        setErrMes(success?"":mes);
    }

    return (<>
        <Tabs>
            <TabList>
                <Flex width='100%'>
                    <Box><Tab>Timers</Tab></Box>
                    <Box><Tab>{isLoggedin ? isLoggedin+"'s Records":"Records"}</Tab></Box>
                    <Spacer />
                    <Button onClick={handleSignState}>Sign {isLoggedin?'Out':'In'}</Button>
                </Flex>
            </TabList>

            <TabPanels>
                <TabPanel>
                    <TimerWithButton t={{days:0, hours:0, minutes:0, seconds:0}} />
                </TabPanel>
                <TabPanel>
                    <RecordPanel />
                </TabPanel>
            </TabPanels>
        </Tabs>
        <Drawer placement='right' onClose={onClose} isOpen={isOpen}>
            <DrawerOverlay />
            <DrawerContent>
                <DrawerHeader>Sign {isin?'In':'Up'}</DrawerHeader>
                <DrawerBody>
                    <FormControl isInvalid={isInvalid}>
                        <FormLabel>User name</FormLabel>
                        <Input placeholder='user name' onChange={handleChangeName} />
                    </FormControl>
                    <FormControl isInvalid={isInvalid}>
                        <FormLabel>Password</FormLabel>
                        <Input type={show ? 'text':'password'} placeholder='Enter password' onChange={handleChangePwd} />
                        <Checkbox onChange={handleCheck}>{show?'Hide':'Show'} password</Checkbox>
                        {!isInvalid ? <></>
                            : <FormErrorMessage>{errMes}</FormErrorMessage>
                        }
                    </FormControl>
                    <Button onClick={() => setSubmitIn('IN')} m={3}>Sign in</Button>
                    <Button onClick={() => setSubmitIn('UP')} m={3}>Sign up</Button>
                </DrawerBody>
            </DrawerContent>
        </Drawer>
    </>);
    /*
     */
}

const root = ReactDOMClient.createRoot(document.getElementById('app'));
root.render(
    <ChakraProvider>
        <App />
    </ChakraProvider>
);
