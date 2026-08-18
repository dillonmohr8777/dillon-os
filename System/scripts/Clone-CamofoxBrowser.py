"""Clone Dillon's camofox-browser fork next to the vault, never into Git.

The vault documents camofox as web-ladder rung 7. The code stays in its own
repo. This script is the only supported way to get a local checkout.

    python System/scripts/Clone-CamofoxBrowser.py
    python System/scripts/Clone-CamofoxBrowser.py --print-path

Destination order:
  1. CAMOFOX_HOME
  2. sibling ../camofox-browser when the vault lives in a repos folder
  3. <vault>/.vendor/camofox-browser (gitignored)

Does not run npm install. First start on a workstation downloads the Camoufox
engine (~300 MB). Cookie import stays disabled until CAMOFOX_API_KEY is set,
which is a credential change and stays approval-gated.
"""
from __future__ import print_function

import argparse
import os
import subprocess
import sys

REPO = 'https://github.com/dillonmohr8777/camofox-browser.git'
BRANCH = 'master'

HERE = os.path.abspath(__file__)
# System/scripts/<file> -> vault root is three dirname calls.
VAULT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))


def default_dest():
    env = os.environ.get('CAMOFOX_HOME')
    if env:
        return os.path.abspath(env)
    parent = os.path.dirname(VAULT)
    sibling = os.path.join(parent, 'camofox-browser')
    if os.path.basename(parent).lower() in ('repos', 'src', 'code', 'projects'):
        return sibling
    return os.path.join(VAULT, '.vendor', 'camofox-browser')


def run(cmd, cwd=None):
    return subprocess.check_output(cmd, cwd=cwd, stderr=subprocess.STDOUT).decode('utf-8', 'replace')


def status(dest):
    if not os.path.isdir(os.path.join(dest, '.git')):
        return {'present': False, 'path': dest, 'head': None, 'remote': None}
    head = run(['git', 'rev-parse', '--short', 'HEAD'], cwd=dest).strip()
    remote = run(['git', 'remote', 'get-url', 'origin'], cwd=dest).strip()
    return {'present': True, 'path': dest, 'head': head, 'remote': remote}


def clone_or_fetch(dest):
    parent = os.path.dirname(dest)
    if not os.path.isdir(parent):
        os.makedirs(parent)
    if os.path.isdir(os.path.join(dest, '.git')):
        run(['git', 'fetch', '--depth', '1', 'origin', BRANCH], cwd=dest)
        run(['git', 'checkout', BRANCH], cwd=dest)
        try:
            run(['git', 'reset', '--hard', 'origin/' + BRANCH], cwd=dest)
        except subprocess.CalledProcessError:
            run(['git', 'reset', '--hard', 'FETCH_HEAD'], cwd=dest)
        return status(dest)
    subprocess.check_call(['git', 'clone', '--depth', '1', '--branch', BRANCH, REPO, dest])
    return status(dest)


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--print-path', action='store_true', help='print dest and exit')
    p.add_argument('--dest', help='override destination path')
    args = p.parse_args(argv)
    dest = os.path.abspath(args.dest) if args.dest else default_dest()
    if args.print_path:
        print(dest)
        return 0
    info = clone_or_fetch(dest)
    print('present=%s' % info['present'])
    print('path=%s' % info['path'])
    print('head=%s' % info['head'])
    print('remote=%s' % info['remote'])
    print('next=cd %s && npm install && npm start  # localhost:9377; do not commit this clone' % dest)
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except subprocess.CalledProcessError as e:
        sys.stderr.write(e.output.decode('utf-8', 'replace') if isinstance(e.output, bytes) else str(e) + '\n')
        sys.exit(e.returncode or 1)
