import type { AlgorithmMeta } from '../../engine/types/algorithm';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <vector>
using namespace std;

struct ListNode {
    int val;
    ListNode* next;
    ListNode(int v) : val(v), next(nullptr) {}
};

// 链表基础操作演示：构建 → 遍历 → 插入 → 删除
ListNode* linkedListOps(const vector<int>& values, int pos) { //>func
    ListNode* head = nullptr, *tail = nullptr;                //>init
    for (int v : values) {                                    //>build-loop
        ListNode* node = new ListNode(v);                     //>build
        if (!head) head = node; else tail->next = node;
        tail = node;
    }
    for (ListNode* cur = head; cur; cur = cur->next) {        //>traverse-loop
        cout << cur->val << " ";                              //>visit
    }
    ListNode* newNode = new ListNode(99);                     //>insert
    if (pos <= 0) { newNode->next = head; head = newNode; }
    else {
        ListNode* prev = head;
        for (int i = 1; i < pos && prev->next; ++i) prev = prev->next;
        newNode->next = prev->next;
        prev->next = newNode;
    }
    if (head && head->next) {                                 //>delete
        ListNode* toDel = head->next;
        head->next = toDel->next;
        delete toDel;
    }
    return head;
}                                                             //>end`;

const csharpSource = `using System;

class ListNode
{
    public int val;
    public ListNode next;
    public ListNode(int v) { val = v; next = null; }
}

class LinkedListOpsDemo
{
    // 链表基础操作演示：构建 → 遍历 → 插入 → 删除
    static ListNode LinkedListOps(int[] values, int pos) {     //>func
        ListNode head = null, tail = null;                     //>init
        foreach (int v in values) {                            //>build-loop
            ListNode node = new ListNode(v);                   //>build
            if (head == null) head = node; else tail.next = node;
            tail = node;
        }
        for (ListNode cur = head; cur != null; cur = cur.next) { //>traverse-loop
            Console.Write(cur.val + " ");                      //>visit
        }
        ListNode newNode = new ListNode(99);                   //>insert
        if (pos <= 0) { newNode.next = head; head = newNode; }
        else {
            ListNode prev = head;
            for (int i = 1; i < pos && prev.next != null; i++) prev = prev.next;
            newNode.next = prev.next;
            prev.next = newNode;
        }
        if (head != null && head.next != null) {              //>delete
            head.next = head.next.next; // GC 自动回收被摘除的节点
        }
        return head;
    }                                                          //>end
}`;

const pythonSource = `class ListNode:
    def __init__(self, val):
        self.val = val
        self.next = None

# 链表基础操作演示：构建 → 遍历 → 插入 → 删除
def linked_list_ops(values, pos):       #>func
    head = tail = None                  #>init
    for v in values:                    #>build-loop
        node = ListNode(v)              #>build
        if head is None:
            head = node
        else:
            tail.next = node
        tail = node
    cur = head
    while cur is not None:              #>traverse-loop
        print(cur.val, end=" ")         #>visit
        cur = cur.next
    new_node = ListNode(99)             #>insert
    if pos <= 0:
        new_node.next = head
        head = new_node
    else:
        prev = head
        for _ in range(1, pos):
            if prev.next is None:
                break
            prev = prev.next
        new_node.next = prev.next
        prev.next = new_node
    if head is not None and head.next is not None:  #>delete
        head.next = head.next.next
    return head                         #>end`;

const pseudocode = `linkedListOps(values, pos):      #>func
  head = tail = null             #>init
  for v in values:               #>build-loop
    node = new ListNode(v)       #>build
    if head == null: head = node
    else: tail.next = node
    tail = node
  cur = head
  while cur != null:             #>traverse-loop
    print cur.val                #>visit
    cur = cur.next
  newNode = new ListNode(99)     #>insert
  # 将 newNode 插入到第 pos 个位置；删除头节点之后的第 1 个节点  #>delete
  return head                    #>end`;

export const linkedListOpsMeta: AlgorithmMeta = {
  id: 'linked-list-ops',
  name: { zh: '链表基础操作', en: 'Linked List Basics' },
  category: 'linked-list',
  difficulty: 'medium',
  description: {
    zh: '链表由节点（数据域 + next 指针）依次串接而成。本演示按顺序完成四项基础操作：用尾插法按数组值构建链表、从头遍历并输出访问序列、在指定位置插入新节点（插入值固定为 99，位置由 aux 指定）、删除头节点之后的第 1 个节点。插入与删除必须小心维护指针：忘更新尾指针会让构建退化为 O(n²)，删除时丢失引用则会造成断链甚至内存泄漏。',
    en: 'A linked list chains nodes (data + next pointer) one after another. This demo performs four basic operations in order: build the list by appending each array value at the tail, traverse from head and print the visit sequence, insert a new node (value fixed at 99, position given by aux) at a given position, and delete the 1st node after the head. Insert and delete require careful pointer maintenance: forgetting to update the tail makes building degrade to O(n²), and losing a reference while deleting breaks the chain or leaks memory.',
  },
  complexity: {
    // 口径：构建/遍历/按位置插入 O(n)；删头后节点 O(1)（best 即该项）
    time: { best: 'O(1)（删头后节点）', average: 'O(n)', worst: 'O(n)' },
    space: 'O(n)',
  },
  prerequisites: [],
  tags: ['链表', '指针', '插入', '删除', '遍历'],
  inputSpec: {
    name: 'values',
    kind: 'int-array',
    minLen: 0,
    maxLen: 6,
    valueMin: 1,
    valueMax: 99,
    allowEmpty: true,
    aux: {
      name: { zh: '插入位置 pos（1..n）', en: 'Insert position pos (1..n)' },
      kind: 'int',
      min: 1,
      max: 6,
      default: 2,
    },
  },
  defaultInput: '3, 7, 2, 9',
  presets: [
    { name: { zh: '标准链表', en: 'Standard list' }, input: '3, 7, 2, 9' },
    { name: { zh: '升序链表', en: 'Ascending list' }, input: '1, 2, 3, 4' },
  ],
  boundaryCases: [
    { name: { zh: '空数组', en: 'Empty array' }, input: '' },
    { name: { zh: '单节点链表', en: 'Single node' }, input: '7' },
    { name: { zh: '长链表', en: 'Longer list' }, input: '1, 2, 3, 4, 5, 6' },
  ],
  runnerId: 'linked-list-ops',
  visualKind: 'linked-list',
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  pseudocode,
  commonMistakes: [
    {
      title: { zh: '忘记更新尾指针 tail', en: 'Forgetting to update the tail pointer' },
      detail: {
        zh: '构建阶段用"每次从头遍历找到末尾再追加"或忘记更新 tail，会导致每次追加都是 O(n)、整体 O(n²)，甚至 tail 指向错误节点造成断链。正确做法是维护 tail 并让 tail->next = node 后再 tail = node。',
        en: 'If you re-traverse from head to find the end on every append, or forget to update tail, building becomes O(n²) overall; a wrong tail even breaks the chain. Maintain tail: set tail->next = node, then tail = node.',
      },
      code: 'tail->next = node;\ntail = node;  // 每次追加后必须更新尾指针',
    },
    {
      title: { zh: '删除时丢失引用导致断链 / 内存泄漏', en: 'Losing references during deletion (broken chain / leak)' },
      detail: {
        zh: '删除节点前必须先保存前驱的 next（或待删节点的 next），先断开引用再释放：直接释放待删节点或让前驱的 next 悬空，链表会断裂；C/C++ 中忘记 delete 则内存泄漏。本演示把目标节点移入"游离区"（detached），直观展示节点已脱离链序。',
        en: 'Before deleting, save the predecessor\'s next (or the target\'s next) first, then unlink and free: freeing the target directly or leaving a dangling predecessor next breaks the list; forgetting delete in C/C++ leaks memory. This demo moves the target into a detached area to visualize it leaving the chain.',
      },
      code: 'ListNode* tmp = prev->next;  // 先保存\nprev->next = tmp->next;          // 再断链\ndelete tmp;                      // 最后释放',
    },
    {
      title: { zh: '插入 / 删除未处理头部位置', en: 'Not handling the head position on insert/delete' },
      detail: {
        zh: '在位置 1 插入时新节点成为头节点，必须更新 head 指针；删除头节点时 head 也要后移。若忘记更新 head，链表会"凭空丢失"头节点。',
        en: 'Inserting at position 1 makes the new node the head — head must be updated; deleting the head also moves head forward. Forgetting to update head silently loses the head node.',
      },
      code: 'if (pos == 1) { newNode->next = head; head = newNode; }',
    },
  ],
};
