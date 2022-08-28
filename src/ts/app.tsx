import React from "react";
import ReactDOMClient from "react-dom/client";
import { ChakraProvider, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import { TimerWithButton } from "./timer";
import { RecordPanel } from './recordPanel';


const root = ReactDOMClient.createRoot(document.getElementById('app'));
root.render(
    <ChakraProvider>
        <Tabs>
            <TabList>
                <Tab>Timers</Tab>
                <Tab>Records</Tab>
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
    </ChakraProvider>
);
