import type { AlgorithmMeta } from '../../engine/types/algorithm';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <vector>
using namespace std;

struct TreeNode {
    int val;
    TreeNode* left, *right;
    TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
};

// 二叉树遍历（以先序遍历为例；中序 / 后序仅调整 visit 的位置）
void preorder(TreeNode* root) {             //>func
    if (root == nullptr) return;            //>init
    visit(root);                            //>visit
    preorder(root->left);                   //>left
    preorder(root->right);                  //>right
}                                           //>end`;

const csharpSource = `using System;

class TreeNode
{
    public int val;
    public TreeNode left, right;
    public TreeNode(int v) { val = v; left = right = null; }
}

class TreeTraversalDemo
{
    // 二叉树遍历（以先序遍历为例；中序 / 后序仅调整 visit 的位置）
    static void Preorder(TreeNode root) {   //>func
        if (root == null) return;           //>init
        Visit(root);                        //>visit
        Preorder(root.left);                //>left
        Preorder(root.right);               //>right
    }                                       //>end
}`;

const pythonSource = `# 二叉树遍历（以先序遍历为例；中序 / 后序仅调整 visit 的位置）
def preorder(root):             #>func
    if root is None:            #>init
        return
    visit(root)                 #>visit
    preorder(root.left)         #>left
    preorder(root.right)        #>right
    # 本帧执行完毕，返回上一层  #>end`;

const pseudocode = `preorder(node):                 #>func
  if node == null: return       #>init
  visit(node)                   #>visit
  preorder(node.left)           #>left
  preorder(node.right)          #>right
  # 本帧执行完毕               #>end`;

export const treeTraversalMeta: AlgorithmMeta = {
  id: 'tree-traversal',
  name: { zh: '二叉树遍历', en: 'Binary Tree Traversal' },
  category: 'tree',
  difficulty: 'medium',
  description: {
    zh: '二叉树遍历按固定顺序访问每个节点恰好一次：前序（根 → 左 → 右）、中序（左 → 根 → 右）、后序（左 → 右 → 根）。三种遍历都要访问全部 n 个节点，时间复杂度均为 O(n)；递归深度等于树高 h，空间复杂度 O(h)。本演示用显式栈模拟递归，调用栈面板可实时观察每一帧的入栈 / 出栈过程。',
    en: 'Binary tree traversal visits every node exactly once in a fixed order: preorder (root → left → right), inorder (left → root → right), postorder (left → right → root). All three visit all n nodes, so time is O(n) for each; recursion depth equals the tree height h, giving O(h) space. This demo simulates recursion with an explicit stack so the call-stack panel shows every frame being pushed and popped in real time.',
  },
  complexity: {
    time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    space: 'O(h)',
  },
  prerequisites: [],
  tags: ['二叉树', '递归', '前序', '中序', '后序'],
  inputSpec: {
    name: 'tree',
    kind: 'tree-array',
    maxLen: 15,
    valueMin: 1,
    valueMax: 99,
    allowEmpty: false,
    aux: {
      name: { zh: '遍历方式（1=前序 2=中序 3=后序）', en: 'Traversal order (1=pre 2=in 3=post)' },
      kind: 'int',
      min: 1,
      max: 3,
      default: 1,
    },
  },
  defaultInput: '1, 2, 3, 4, 5, 6, 7',
  presets: [
    { name: { zh: '满二叉树', en: 'Full binary tree' }, input: '1, 2, 3, 4, 5, 6, 7' },
    { name: { zh: '完全二叉树', en: 'Complete binary tree' }, input: '10, 20, 30, 40, 50' },
  ],
  boundaryCases: [
    { name: { zh: '单节点树', en: 'Single node' }, input: '7' },
    { name: { zh: '左斜树', en: 'Left-skewed tree' }, input: '1, 2, null, 3' },
    { name: { zh: '右斜树', en: 'Right-skewed tree' }, input: '1, null, 2, null, null, null, 3' },
  ],
  runnerId: 'tree-traversal',
  visualKind: 'tree',
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  pseudocode,
  commonMistakes: [
    {
      title: { zh: '中序 / 后序访问时机放错', en: 'Visiting at the wrong time in inorder / postorder' },
      detail: {
        zh: '把 visit 放在错误位置会得到完全不同的输出：中序要求先左子树、再访问、再右子树；后序要求先左右子树、最后才访问。把中序的 visit 误放到左子树之前，输出就变成了前序。',
        en: 'Putting visit at the wrong point yields a different sequence: inorder must visit after the left subtree and before the right one; postorder visits only after both subtrees. Placing inorder\'s visit before the left subtree turns it into preorder.',
      },
      code: 'inorder(node):  left(node) → visit(node) → right(node)\npostorder(node): left(node) → right(node) → visit(node)',
    },
    {
      title: { zh: '遗漏空指针判断', en: 'Missing the null check' },
      detail: {
        zh: '递归入口必须判空（root == null 直接返回）。叶子节点的左 / 右孩子都是 null，若不判空直接访问 node->val 会崩溃；空树也会直接越界。',
        en: 'Every recursive call must check for null first. A leaf\'s children are both null; dereferencing node->val without the check crashes, and so does an empty tree.',
      },
      code: 'if (root == nullptr) return;  // 递归第一行',
    },
    {
      title: { zh: '后序把左右子树顺序颠倒', en: 'Swapping left and right in postorder' },
      detail: {
        zh: '后序必须是"左 → 右 → 访问"。若先递归右子树再递归左子树，输出会变成镜像序列，中序 / 后序尤其明显。',
        en: 'Postorder must be left → right → visit. Recursing right before left produces the mirrored sequence, which is obvious in inorder and postorder.',
      },
    },
  ],
};
