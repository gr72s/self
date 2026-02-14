import importlib
import pkgutil
import click
from cli import commands

def normalize_token(token):
    """Normalize token by replacing dashes with underscores"""
    return token.replace('-', '_')

@click.group(
    context_settings={"token_normalize_func": normalize_token},
)
def self_cli():
    """Self API CLI"""
    pass

# 为了与setup.py中的entry_points匹配，创建一个别名
def self():
    """Self API CLI"""
    self_cli()

# 实现命令自动发现机制
def discover_commands():
    """Discover and add all commands from the commands package"""
    for _, module_name, _ in pkgutil.walk_packages(
        commands.__path__, commands.__name__ + "."
    ):
        module = importlib.import_module(module_name)
        for attribute_name in dir(module):
            attribute = getattr(module, attribute_name)
            if isinstance(attribute, (click.core.Command, click.core.Group)):
                self_cli.add_command(attribute)

# 发现并添加所有命令
discover_commands()

if __name__ == "__main__":
    self()