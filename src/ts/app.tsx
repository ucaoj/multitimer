import React from "react";
import ReactDOMClient from "react-dom/client";
import { ChakraProvider } from '@chakra-ui/react';
import TimerWithButton from "./timer";

const root = ReactDOMClient.createRoot(document.getElementById('app'));
root.render(
    <ChakraProvider>
        <TimerWithButton t={{days:0, hours:0, minutes:0, seconds:0}} />
    </ChakraProvider>
);
