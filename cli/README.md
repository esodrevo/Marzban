# Marzban CLI

A modern, type-safe command-line interface for managing Marzban, built with Typer.

## Features

- 🎯 Type-safe CLI with rich output
- 📊 Beautiful tables and panels
- 🔒 Secure admin management
- 👥 User account listing
- 🖥️ Node listing
- 📈 System status monitoring
- ⌨️ Interactive prompts and confirmations

## Installation

The CLI is included with Marzban and can be used directly:
```bash
marzban cli --help

# Or from the project root
uv run marzban-cli.py --help
```

## Usage

### General Commands

```bash
# Show version
marzban cli version

# Show help
marzban cli --help
```

### Admin Management

```bash
# List all admins
marzban cli admins --list

# Create new admin
marzban cli admins --create username

# Delete admin
marzban cli admins --delete username

# Modify admin (password and sudo status)
marzban cli admins --modify username

# Reset admin usage
marzban cli admins --reset-usage username
```

### User Account Listing

```bash
# List all users
marzban cli users

# List users with status filter
marzban cli users --status active

# List users with pagination
marzban cli users --offset 10 --limit 20
```

### Node Listing

```bash
# List all nodes
marzban cli nodes
```

### System Information

```bash
# Show system status
marzban cli system
```
