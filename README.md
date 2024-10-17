# For Tazama, Developed By Paysys Labs

# Message Relay Service

A TypeScript-based service that bridges communication between TMS (Tazama Monitoring Service) and client applications handling transaction processing and analysis.

## Overview

This service acts as an intermediary, reading messages from a NATS server and forwarding them to various client-side message queue implementations, including RabbitMQ, REST API, or NATS. Its primary purpose is to facilitate seamless communication between TMS and transaction processing/analysis applications.

- [Features](#features): Key Features
- [Configuration](#configuration): Service configuration
- [Environment Variables](#environment-variables): Configure the service with these essential settings
- [Major Functions](#major-functions): Understand the core functionalities of the Message Relaying Service
- [Usage](#usage): How to start and operate the service effectively
- [Contributing](#contributing): Contribute to this project
- [License](#license): Information about the service's licensing terms

## Features

- Supports multiple input sources: NATS
- Compatible with various output destinations: RabbitMQ, REST API, and NATS
- Built using TypeScript for enhanced type safety and maintainability
- Designed specifically for financial risk management and transaction processing scenarios

## Configuration

The service can be configured through environment variables or a configuration file. Refer to the `.env.template.*` or `/config/index.ts` file based on your requirement for available settings.

## Environment Variables

The service can be configured using the following environment variables:

### Init Variables

| Variable     | Description                                         |
| ------------ | --------------------------------------------------- |
| STARTUP_TYPE | nats                                                |
| NODE_ENV     | Node.js environment (e.g., production, development) |

### Consumer Variables

#### Nats Consumer Variables

| Variable        | Description                                       |
| --------------- | ------------------------------------------------- |
| CONSUMER_URL    | URL for the NATS consumer                         |
| CONSUMER_STREAM | Name of the stream for the NATS consumer          |
| FUNCTION_NAME   | Name of the function associated with the consumer |

### Destination Variables

#### Nats Producer Variables

| Variable         | Description                              |
| ---------------- | ---------------------------------------- |
| DESTINATION_TYPE | nats                                     |
| DESTINATION_URL  | URL for the NATS destination             |
| PRODUCER_STREAM  | Name of the stream for the NATS producer |

#### RabbitMQ Producer Variables

| Variable         | Description                                 |
| ---------------- | ------------------------------------------- |
| DESTINATION_TYPE | rabbitmq                                    |
| DESTINATION_URL  | URL for the RabbitMQ destination            |
| Queue            | Name of the queue for the RabbitMQ producer |

#### RESTAPI Producer Variables

| Variable         | Description                      |
| ---------------- | -------------------------------- |
| DESTINATION_TYPE | rest                             |
| DESTINATION_URL  | URL for the REST API destination |

### General Configuration

| Variable  | Description                              |
| --------- | ---------------------------------------- |
| LOG_LEVEL | Logging level (e.g., info, debug, error) |

## Major Functions

The Message Relaying Service offers several core functions that work together to enable efficient message forwarding. These functions are designed to handle different aspects of the message relaying process.

### 1. Start Function

typescript start: () => Promise<boolean | void>

The `start` function initializes the service by setting up subscribers to read messages from the configured input source. After successful initialization, it calls the `relayMessage` function to begin the message forwarding process.

### 2. Initialize Producer Function

typescript initProducer: () => Promise<boolean>

This function is responsible for setting up a producer connection based on the destination type specified in the configuration (`config.destinationType`). The function supports three destination types: NATS, RabbitMQ, and REST API. It establishes the appropriate connection and prepares the service for relaying messages to the destination.

### 3. Relay Message Function

typescript relayMessage: (message: Uint8Array) => Promise<boolean | void>

This function acts as the central hub for message forwarding. It determines the appropriate destination service/messaging queue based on the (`config.destinationType`) and calls the corresponding relay function. Supported destinations include RabbitMQ, NATS, and REST API.

### 4. Destination-Specific Relay Functions

The following functions handle the actual forwarding of messages to their respective destinations:

#### Relay to NATS

typescript relayToNats: (message: string) => Promise<boolean | void>

This function forwards messages to a NATS listener.

#### Relay to RabbitMQ

typescript relayToRabbitMQ: (message: string) => Promise<boolean | void>

This function sends messages to a RabbitMQ listener.

#### Relay to REST API

typescript relayToRestAPI: (message: string) => Promise<boolean | void>

This function forwards messages to an endpoint on a server via REST API.

## Usage

Once configured, the service will automatically start reading messages from the specified input source and forwarding them to the designated output destination. This process involves:

1. Calling the `start()` function to initialize subscribers and begin message reading.
2. Processing incoming messages through the `relayMessage()` function.
3. Forwarding messages to the appropriate destination using one of the destination-specific relay functions.

The service continues to operate until manually stopped, continuously monitoring the input source and relaying messages as they arrive.

## Contributing

...

## License

...
